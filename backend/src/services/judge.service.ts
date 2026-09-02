import mongoose from "mongoose";
import * as submissionRepository from "../repositories/submission.repository.js";
import * as problemRepository from "../repositories/problem.repository.js";
import { findTestCasesByProblemId, } from "../repositories/testCase.repository.js";
import { executeCode, } from "./codeExecutor.service.js";
import type { SubmissionLanguage, } from "../models/submission.model.js";
import { AppError, } from "../utils/AppError.js";


function normalizeOutput(output: string): string {
    return output.replace(/\r\n/g, "\n").trim();
}


export async function judgeSubmission(submissionId: string) {
    if (!mongoose.isValidObjectId(submissionId)) {
        throw new AppError("Invalid submission ID", 400);
    }


    //Get submission
    const submission = await submissionRepository.findSubmissionById(submissionId);

    if (!submission) {
        throw new AppError("Submission not found", 404);
    }


    // Make sure submission can be judged
    if (submission.status !== "running") {
        throw new AppError(`Submission cannot be judged from status: ${submission.status}`, 400);
    }


    // 3. Get problem
    const problem = await problemRepository.findProblemById(submission.problemId.toString());

    if (!problem) {
        await submissionRepository.updateSubmissionResult(
            submissionId,
            {
                status: "system_error",
            }
        );

        throw new AppError("Problem associated with submission was not found", 404);
    }



    // 4. Get test cases
    const testCases = await findTestCasesByProblemId(submission.problemId.toString());
    if (testCases.length === 0) {
        await submissionRepository.updateSubmissionResult(
            submissionId,
            {
                status: "system_error",
            }
        );

        throw new AppError("No test cases found for this problem", 500);
    }


    // 5. Execute every test case
    let totalRuntime = 0;
    for (const testCase of testCases) {
        const result = await executeCode({
            code: submission.code,
            language: submission.language as SubmissionLanguage,
            input: testCase.input,
            timeoutMs: 2000,
        });

        totalRuntime += result.runtime;


        // Time limit exceeded
        if (result.type === "timeout") {
            const updatedSubmission = await submissionRepository.updateSubmissionResult(
                submissionId,
                {
                    status: "time_limit_exceeded",
                    runtime: Math.round(totalRuntime),
                }
            );

            return updatedSubmission;
        }


        // Compile error
        if (result.type === "compile_error") {
            const updatedSubmission = await submissionRepository.updateSubmissionResult(
                submissionId,
                {
                    status: "compile_error",
                    runtime: Math.round(totalRuntime),
                    failedTestCase: {
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput,
                        actualOutput: result.output,
                    },
                }
            );
            return updatedSubmission;
        }


        // Runtime error
        if (result.type === "runtime_error") {
            const updatedSubmission = await submissionRepository.updateSubmissionResult(
                submissionId,
                {
                    status: "runtime_error",
                    runtime: Math.round(totalRuntime),
                    failedTestCase: {
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput,
                        actualOutput: result.output,
                    },
                }
            );

            return updatedSubmission;
        }


        // Compare output
        const actualOutput = normalizeOutput(result.output);

        const expectedOutput = normalizeOutput(testCase.expectedOutput);

        if (actualOutput !== expectedOutput) {
            const updatedSubmission = await submissionRepository.updateSubmissionResult(
                submissionId,
                {
                    status: "wrong_answer",
                    runtime: Math.round(totalRuntime),
                    failedTestCase: {
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput,
                        actualOutput: result.output,
                    },
                }
            );

            return updatedSubmission;
        }
    }


    // 6. All test cases passed
    const updatedSubmission = await submissionRepository.updateSubmissionResult(
        submissionId,
        {
            status: "accepted",
            runtime: Math.round(totalRuntime),
        }
    );

    return updatedSubmission;
}
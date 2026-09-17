import mongoose from "mongoose";
import * as submissionRepository from "../repositories/submission.repository.js";
import * as problemRepository from "../repositories/problem.repository.js";
import { findTestCasesByProblemId } from "../repositories/testCase.repository.js";
import { executeCode } from "./codeExecutor.service.js";
import type { SubmissionLanguage } from "../models/submission.model.js";
import { AppError } from "../utils/AppError.js";

function normalizeOutput(output: string): string {
    return output.replace(/\r\n/g, "\n").trim();
}

export async function judgeSubmission(submissionId: string) {
    console.log(`[JUDGE] Started for submission: ${submissionId}`);
    console.time(`[JUDGE_TOTAL] ${submissionId}`);

    if (!mongoose.isValidObjectId(submissionId)) {
        throw new AppError("Invalid submission ID", 400);
    }

    const submission = await submissionRepository.findSubmissionById(submissionId);
    if (!submission) {
        throw new AppError("Submission not found", 404);
    }
    if (submission.status !== "running") {
        throw new AppError(`Submission cannot be judged from status: ${submission.status}`, 400);
    }

    const problem = await problemRepository.findProblemById(
        submission.problemId.toString()
    );
    if (!problem) {
        await submissionRepository.updateSubmissionResult(submissionId, { status: "system_error" });
        throw new AppError("Problem associated with submission was not found", 404);
    }

    const testCases = await findTestCasesByProblemId(submission.problemId.toString());
    if (testCases.length === 0) {
        await submissionRepository.updateSubmissionResult(submissionId, { status: "system_error" });
        throw new AppError("No test cases found for this problem", 500);
    }

    console.log(`[JUDGE] Found ${testCases.length} test cases to execute.`);

    let totalRuntime = 0;
    let index = 1;

    for (const testCase of testCases) {
        console.time(`[TEST_CASE] ${index}`);

        const result = await executeCode({
            code: submission.code,
            language: submission.language as SubmissionLanguage,
            input: testCase.input,
            timeoutMs: 2000,
        });

        console.timeEnd(`[TEST_CASE] ${index}`);
        console.log(`[TEST_CASE] ${index} result type: ${result.type}, runtime: ${result.runtime}ms`);

        totalRuntime += result.runtime;
        index++;

        // Docker/system-level failure
        if (result.type === "system_error") {
            console.timeEnd(`[JUDGE_TOTAL] ${submissionId}`);
            return await submissionRepository.updateSubmissionResult(
                submissionId,
                {
                    status: "system_error",
                    runtime: Math.round(totalRuntime),
                }
            );
        }

        // Time limit exceeded
        if (result.type === "timeout") {
            console.timeEnd(`[JUDGE_TOTAL] ${submissionId}`);
            return await submissionRepository.updateSubmissionResult(
                submissionId,
                {
                    status: "time_limit_exceeded",
                    runtime: Math.round(totalRuntime),
                }
            );
        }

        // Compilation error
        if (result.type === "compile_error") {
            console.timeEnd(`[JUDGE_TOTAL] ${submissionId}`);
            return await submissionRepository.updateSubmissionResult(
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
        }

        // Runtime error
        if (result.type === "runtime_error") {
            console.timeEnd(`[JUDGE_TOTAL] ${submissionId}`);
            return await submissionRepository.updateSubmissionResult(
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
        }

        // Output comparison
        const actualOutput = normalizeOutput(result.output);
        const expectedOutput = normalizeOutput(testCase.expectedOutput);
        if (actualOutput !== expectedOutput) {
            console.timeEnd(`[JUDGE_TOTAL] ${submissionId}`);
            return await submissionRepository.updateSubmissionResult(
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
        }
    }

    console.timeEnd(`[JUDGE_TOTAL] ${submissionId}`);
    console.log(`[JUDGE] All test cases passed successfully! Total runtime: ${Math.round(totalRuntime)}ms`);

    // Every test case passed
    return await submissionRepository.updateSubmissionResult(
        submissionId,
        {
            status: "accepted",
            runtime: Math.round(totalRuntime),
        }
    );
}
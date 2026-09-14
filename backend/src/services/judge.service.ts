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
    if (!mongoose.isValidObjectId(submissionId)) {
        throw new AppError("Invalid submission ID", 400);
    }

    const submission =
        await submissionRepository.findSubmissionById(submissionId);

    if (!submission) {
        throw new AppError("Submission not found", 404);
    }

    if (submission.status !== "running") {
        throw new AppError(
            `Submission cannot be judged from status: ${submission.status}`,
            400
        );
    }

    const problem = await problemRepository.findProblemById(
        submission.problemId.toString()
    );

    if (!problem) {
        await submissionRepository.updateSubmissionResult(
            submissionId,
            {
                status: "system_error",
            }
        );

        throw new AppError(
            "Problem associated with submission was not found",
            404
        );
    }

    const testCases = await findTestCasesByProblemId(
        submission.problemId.toString()
    );

    if (testCases.length === 0) {
        await submissionRepository.updateSubmissionResult(
            submissionId,
            {
                status: "system_error",
            }
        );

        throw new AppError(
            "No test cases found for this problem",
            500
        );
    }

    let totalRuntime = 0;

    for (const testCase of testCases) {
        const result = await executeCode({
            code: submission.code,
            language: submission.language as SubmissionLanguage,
            input: testCase.input,
            timeoutMs: 2000,
        });

        totalRuntime += result.runtime;

        // Docker/system-level failure
        if (result.type === "system_error") {
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

        // Only success reaches output comparison
        const actualOutput = normalizeOutput(result.output);
        const expectedOutput = normalizeOutput(
            testCase.expectedOutput
        );

        if (actualOutput !== expectedOutput) {
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

    // Every test case passed
    return await submissionRepository.updateSubmissionResult(
        submissionId,
        {
            status: "accepted",
            runtime: Math.round(totalRuntime),
        }
    );
}
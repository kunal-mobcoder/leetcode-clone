import mongoose from "mongoose";

import * as submissionRepository
    from "../repositories/submission.repository.js";

import * as problemRepository
    from "../repositories/problem.repository.js";

import type {
    CreateSubmissionInput,
} from "../schemas/submission/createSubmission.schema.js";

import type { RunCodeInput } from "../schemas/submission/runCode.schema.js";
import { findPublicTestCasesByProblemId } from "../repositories/testCase.repository.js";
import { executeCode, type SupportedLanguage } from "./codeExecutor.service.js";

import type { SubmissionQuery } from "../schemas/submission/submissionQuery.schema.js";

import { AppError } from "../utils/AppError.js";

import { enqueueSubmission } from "../queues/submission.queue.js";


export async function createSubmissionService(
    data: CreateSubmissionInput,
    userId: string
) {

    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError(
            "Invalid user ID",
            401
        );
    }


    if (!mongoose.isValidObjectId(data.problemId)) {
        throw new AppError(
            "Invalid problem ID",
            400
        );
    }


    const problem =
        await problemRepository.findProblemById(
            data.problemId
        );


    if (!problem) {
        throw new AppError(
            "Problem not found",
            404
        );
    }


    if (problem.status === "archived") {
        throw new AppError(
            "Cannot submit to an archived problem",
            400
        );
    }


    if (problem.status !== "published") {
        throw new AppError(
            "Cannot submit to an unpublished problem",
            400
        );
    }


    const submission = await submissionRepository.createSubmission({
        userId: new mongoose.Types.ObjectId(userId),
        problemId: new mongoose.Types.ObjectId(data.problemId),
        code: data.code,
        language: data.language,
    });

    try {
        await enqueueSubmission(submission._id.toString());
    } catch (error) {
        await submissionRepository.updateSubmissionResult(
            submission._id.toString(),
            {
                status: "system_error",
            }
        );

        throw error;
    }

    return submission;
}


/**
 * Get a single submission belonging to the
 * authenticated user.
 */
export async function getSubmissionByIdService(
    submissionId: string,
    userId: string
) {

    if (!mongoose.isValidObjectId(submissionId)) {
        throw new AppError(
            "Invalid submission ID",
            400
        );
    }


    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError(
            "Invalid user ID",
            401
        );
    }


    const submission =
        await submissionRepository.findSubmissionById(
            submissionId
        );


    if (!submission) {
        throw new AppError(
            "Submission not found",
            404
        );
    }


    if (
        submission.userId.toString()
        !== userId
    ) {
        throw new AppError(
            "You do not have access to this submission",
            403
        );
    }


    return submission;
}


/**
 * Get submissions belonging to the authenticated user.
 *
 * Pagination is handled here because pagination
 * is a business/application concern, while the
 * repository only performs database operations.
 */
export async function getMySubmissionsService(
    userId: string,
    query: SubmissionQuery
) {

    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError(
            "Invalid user ID",
            401
        );
    }


    const skip =
        (query.page - 1) * query.limit;


    const [
        submissions,
        total,
    ] = await Promise.all([

        submissionRepository.findSubmissionsByUserId(
            userId,
            skip,
            query.limit
        ),

        submissionRepository.countSubmissionsByUserId(
            userId
        ),

    ]);


    const totalPages =
        Math.ceil(
            total / query.limit
        );


    return {

        submissions,

        pagination: {

            page: query.page,

            limit: query.limit,

            total,

            totalPages,

            hasNextPage:
                query.page < totalPages,

            hasPreviousPage:
                query.page > 1,
        },
    };
}

export async function getUserSubmissionsService(
    userId: string,
    page: number,
    limit: number,
    problemId?: string
) {
    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid user ID", 401);
    }

    if (problemId && !mongoose.isValidObjectId(problemId)) {
        throw new AppError("Invalid problem ID", 400);
    }

    const skip = (page - 1) * limit;

    let submissions;
    let total;

    if (problemId) {
        [
            submissions,
            total,
        ] = await Promise.all([
            submissionRepository.findSubmissionsByUserIdAndProblemId(
                userId,
                problemId,
                skip,
                limit
            ),

            submissionRepository.countSubmissionsByUserIdAndProblemId(
                userId,
                problemId
            ),
        ]);
    } else {
        [
            submissions,
            total,
        ] = await Promise.all([
            submissionRepository.findSubmissionsByUserId(
                userId,
                skip,
                limit
            ),

            submissionRepository.countSubmissionsByUserId(
                userId
            ),
        ]);
    }

    const totalPages =
        Math.ceil(total / limit);

    return {
        submissions,

        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage:
                page < totalPages,
            hasPreviousPage:
                page > 1,
        },
    };
}

function normalizeOutput(output: string): string {
    const trimmed = output.replace(/\r\n/g, "\n").trim();
    try {
        return JSON.stringify(JSON.parse(trimmed));
    } catch {
        return trimmed;
    }
}

export async function runCodeService(data: RunCodeInput) {
    if (!mongoose.isValidObjectId(data.problemId)) {
        throw new AppError("Invalid problem ID", 400);
    }

    const problem = await problemRepository.findProblemById(data.problemId);
    if (!problem) {
        throw new AppError("Problem not found", 404);
    }

    let testCasesToRun: Array<{ input: string; expectedOutput?: string }> = [];

    if (data.customInput !== undefined && data.customInput.trim().length > 0) {
        testCasesToRun = [{ input: data.customInput.trim() }];
    } else {
        const publicCases = await findPublicTestCasesByProblemId(data.problemId);
        if (publicCases.length > 0) {
            testCasesToRun = publicCases.map((tc) => ({
                input: tc.input,
                expectedOutput: tc.expectedOutput,
            }));
        } else if (problem.examples && problem.examples.length > 0) {
            testCasesToRun = problem.examples.map((ex) => ({
                input: ex.input,
                expectedOutput: ex.output,
            }));
        } else {
            testCasesToRun = [{ input: "" }];
        }
    }

    const results = [];
    let allPassed = true;

    for (const tc of testCasesToRun) {
        const execResult = await executeCode({
            code: data.code,
            language: data.language as SupportedLanguage,
            input: tc.input,
            timeoutMs: 3000,
            entryFunctionName: problem.entryFunctionName,
        });

        const normalizedActual = normalizeOutput(execResult.output);
        const normalizedExpected = tc.expectedOutput ? normalizeOutput(tc.expectedOutput) : undefined;
        const passed = normalizedExpected !== undefined ? normalizedActual === normalizedExpected : undefined;

        if (passed === false || execResult.type !== "success") {
            allPassed = false;
        }

        results.push({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: normalizedActual,
            type: execResult.type,
            runtime: execResult.runtime,
            passed,
        });
    }

    return {
        status: allPassed ? "success" : "failed",
        results,
    };
}
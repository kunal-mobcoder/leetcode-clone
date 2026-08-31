import mongoose from "mongoose";

import * as submissionRepository
    from "../repositories/submission.repository.js";

import * as problemRepository
    from "../repositories/problem.repository.js";

import type {
    CreateSubmissionInput,
} from "../schemas/submission/createSubmission.schema.js";

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

    await enqueueSubmission(submission._id.toString())

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
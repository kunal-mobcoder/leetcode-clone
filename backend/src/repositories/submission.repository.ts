import mongoose from "mongoose";

import SubmissionModel from "../models/submission.model.js";

import type {
    SubmissionStatus,
    SubmissionLanguage,
    FailedTestCase,
} from "../models/submission.model.js";


/**
 * Data required to create a submission.
 *
 * The userId comes from the authenticated user.
 * The problemId, code and language come from the request.
 *
 * Status is intentionally NOT accepted here.
 *
 * Every newly created submission must start as "pending".
 */
interface CreateSubmissionData {
    userId: mongoose.Types.ObjectId;
    problemId: mongoose.Types.ObjectId;
    code: string;
    language: SubmissionLanguage;
}


/**
 * Data that can be updated after the judge processes
 * the submission.
 *
 * The judge will use this to store:
 *
 * - final status
 * - execution runtime
 * - memory usage
 * - failed test case information
 */
interface UpdateSubmissionResultData {
    status: SubmissionStatus;
    runtime?: number;
    memory?: number;
    failedTestCase?: FailedTestCase;
}


/**
 * Create a new submission.
 *
 * Every submission starts with:
 *
 * pending
 *
 * The judge will later move it through the submission
 * lifecycle.
 */
export async function createSubmission(
    data: CreateSubmissionData
) {

    return SubmissionModel.create({
        ...data,

        status: "pending",
    });
}


/**
 * Find a submission by its ID.
 *
 * Returns null when the supplied ID is not a valid
 * MongoDB ObjectId or when the submission doesn't exist.
 */
export async function findSubmissionById(
    submissionId: string
) {

    if (!mongoose.isValidObjectId(submissionId)) {
        return null;
    }

    return SubmissionModel.findById(
        submissionId
    );
}


/**
 * Find submissions created by a particular user.
 *
 * Results are ordered from newest to oldest.
 */
export async function findSubmissionsByUserId(
    userId: string,
    skip: number,
    limit: number
) {

    if (!mongoose.isValidObjectId(userId)) {
        return [];
    }

    return SubmissionModel
        .find({
            userId:
                new mongoose.Types.ObjectId(userId),
        })
        .sort({
            createdAt: -1,
        })
        .skip(skip)
        .limit(limit);
}


/**
 * Count the total number of submissions
 * created by a user.
 */
export async function countSubmissionsByUserId(
    userId: string
) {

    if (!mongoose.isValidObjectId(userId)) {
        return 0;
    }

    return SubmissionModel.countDocuments({
        userId:
            new mongoose.Types.ObjectId(userId),
    });
}


/**
 * Find submissions for a particular problem.
 *
 * Results are ordered from newest to oldest.
 *
 * This can later be useful for:
 *
 * - admin submission monitoring
 * - problem statistics
 * - leaderboard calculations
 */
export async function findSubmissionsByProblemId(
    problemId: string,
    skip: number,
    limit: number
) {

    if (!mongoose.isValidObjectId(problemId)) {
        return [];
    }

    return SubmissionModel
        .find({
            problemId:
                new mongoose.Types.ObjectId(problemId),
        })
        .sort({
            createdAt: -1,
        })
        .skip(skip)
        .limit(limit);
}


/**
 * Count the total number of submissions
 * for a particular problem.
 */
export async function countSubmissionsByProblemId(
    problemId: string
) {

    if (!mongoose.isValidObjectId(problemId)) {
        return 0;
    }

    return SubmissionModel.countDocuments({
        problemId:
            new mongoose.Types.ObjectId(problemId),
    });
}


/**
 * Update the result of a submission.
 *
 * This is primarily intended for the judge system.
 *
 * Example:
 *
 * pending
 *    ↓
 * running
 *    ↓
 * accepted
 *
 * or
 *
 * wrong_answer
 * runtime_error
 * compile_error
 * etc.
 */
export async function updateSubmissionResult(
    submissionId: string,
    data: UpdateSubmissionResultData
) {

    if (!mongoose.isValidObjectId(submissionId)) {
        return null;
    }

    return SubmissionModel.findByIdAndUpdate(
        submissionId,

        {
            $set: {
                status: data.status,

                ...(data.runtime !== undefined && {
                    runtime: data.runtime,
                }),

                ...(data.memory !== undefined && {
                    memory: data.memory,
                }),

                ...(data.failedTestCase !== undefined && {
                    failedTestCase:
                        data.failedTestCase,
                }),
            },
        },

        {
            new: true,
            runValidators: true,
        }
    );
}


/**
 * Update only the submission status.
 *
 * Useful when the judge needs to transition
 * the submission between states.
 *
 * Example:
 *
 * pending → running
 */
export async function updateSubmissionStatus(
    submissionId: string,
    status: SubmissionStatus
) {

    if (!mongoose.isValidObjectId(submissionId)) {
        return null;
    }

    return SubmissionModel.findByIdAndUpdate(
        submissionId,

        {
            $set: {
                status,
            },
        },

        {
            new: true,
            runValidators: true,
        }
    );
}


export async function findSubmissionsByUserIdAndProblemId(
    userId: string,
    problemId: string,
    skip: number,
    limit: number
) {
    return SubmissionModel
        .find({
            userId: new mongoose.Types.ObjectId(userId),
            problemId: new mongoose.Types.ObjectId(problemId),
        })
        .sort({
            createdAt: -1,
        })
        .skip(skip)
        .limit(limit);
}


export async function countSubmissionsByUserIdAndProblemId(
    userId: string,
    problemId: string
) {
    return SubmissionModel.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        problemId: new mongoose.Types.ObjectId(problemId),
    });
}
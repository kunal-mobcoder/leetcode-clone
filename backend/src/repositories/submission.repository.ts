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
 * Status is intentionally not accepted here.
 *
 * Every newly created submission starts as:
 *
 * pending
 */
interface CreateSubmissionData {
    userId: mongoose.Types.ObjectId;
    problemId: mongoose.Types.ObjectId;
    code: string;
    language: SubmissionLanguage;
}


/**
 * Data that can be updated after the judge
 * processes a submission.
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
 * New submissions always start with "pending".
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
 * Find a submission by ID.
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
 * Find all submissions belonging to a user.
 *
 * Newest submissions are returned first.
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
            userId: new mongoose.Types.ObjectId(userId),
        })
        .sort({
            createdAt: -1,
        })
        .skip(skip)
        .limit(limit);
}


/**
 * Count all submissions belonging to a user.
 */
export async function countSubmissionsByUserId(
    userId: string
) {
    if (!mongoose.isValidObjectId(userId)) {
        return 0;
    }

    return SubmissionModel.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
    });
}


/**
 * Find all submissions for a particular problem.
 *
 * Primarily useful for:
 *
 * - admin monitoring
 * - problem statistics
 * - submission analytics
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
            problemId: new mongoose.Types.ObjectId(problemId),
        })
        .sort({
            createdAt: -1,
        })
        .skip(skip)
        .limit(limit);
}


/**
 * Count all submissions for a particular problem.
 */
export async function countSubmissionsByProblemId(
    problemId: string
) {
    if (!mongoose.isValidObjectId(problemId)) {
        return 0;
    }

    return SubmissionModel.countDocuments({
        problemId: new mongoose.Types.ObjectId(problemId),
    });
}


/**
 * Find submissions made by a specific user
 * for a specific problem.
 *
 * Used for:
 *
 * - user's submission history for a problem
 * - problem submission page
 */
export async function findSubmissionsByUserIdAndProblemId(
    userId: string,
    problemId: string,
    skip: number,
    limit: number
) {
    if (!mongoose.isValidObjectId(userId)) {
        return [];
    }

    if (!mongoose.isValidObjectId(problemId)) {
        return [];
    }

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


/**
 * Count submissions made by a user
 * for a particular problem.
 */
export async function countSubmissionsByUserIdAndProblemId(
    userId: string,
    problemId: string
) {
    if (!mongoose.isValidObjectId(userId)) {
        return 0;
    }

    if (!mongoose.isValidObjectId(problemId)) {
        return 0;
    }

    return SubmissionModel.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),

        problemId: new mongoose.Types.ObjectId(problemId),
    });
}


/**
 * Update the complete result of a submission.
 *
 * The judge will use this after execution.
 *
 * Example:
 *
 * pending
 *    ↓
 * running
 *    ↓
 * accepted
 *
 * or:
 *
 * wrong_answer
 * runtime_error
 * compile_error
 * time_limit_exceeded
 * system_error
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
                    failedTestCase: data.failedTestCase,
                }),
            },
        },

        {
            returnDocument: "after",
            runValidators: true,
        }
    );
}


/**
 * Update only the submission status.
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
            returnDocument: "after",
            runValidators: true,
        }
    );
}
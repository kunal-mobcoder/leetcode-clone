import mongoose from "mongoose";
import SubmissionModel from "../models/submission.model.js";
import type {
    SubmissionStatus,
} from "../models/submission.model.js";


export async function createSubmission(data: {
    userId: mongoose.Types.ObjectId;
    problemId: mongoose.Types.ObjectId;
    code: string;
    language: "javascript" | "python" | "java" | "cpp";
}) {
    return SubmissionModel.create({
        ...data,
        status: "pending",
    });
}


export async function findSubmissionById(
    submissionId: string
) {
    if (!mongoose.isValidObjectId(submissionId)) {
        return null;
    }

    return SubmissionModel.findById(submissionId);
}


export async function findSubmissionsByUserId(
    userId: string,
    skip: number,
    limit: number
) {
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


export async function countSubmissionsByUserId(
    userId: string
) {
    return SubmissionModel.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
    });
}


export async function findSubmissionsByProblemId(
    problemId: string,
    skip: number,
    limit: number
) {
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


export async function countSubmissionsByProblemId(
    problemId: string
) {
    return SubmissionModel.countDocuments({
        problemId: new mongoose.Types.ObjectId(problemId),
    });
}


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
import mongoose from "mongoose";
import ProblemModel from "../models/problem.model.js";
import type { CreateProblemInput, } from "../schemas/problem/createProblem.schema.js";
import type { UpdateProblemInput, } from "../schemas/problem/updateProblem.schema.js";
import type { ProblemDifficulty, } from "../models/problem.model.js";


interface CreateProblemData
    extends CreateProblemInput {
    createdBy: mongoose.Types.ObjectId;
}


interface FindProblemsOptions {
    page: number;
    limit: number;

    difficulty?: ProblemDifficulty;
    tag?: string;
    search?: string;

    sort: "title" | "difficulty" | "createdAt";
    order: "asc" | "desc";

    status?: "draft" | "published" | "archived";
}


export async function findProblemBySlug(slug: string, status?: "draft" | "published" | "archived") {

    const filter: Record<string, unknown> = { slug };

    if (status !== undefined) {
        filter.status = status;
    }

    return ProblemModel.findOne(filter).lean();
}


export async function findProblemById(id: string) {

    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return ProblemModel.findById(id).lean();
}


export async function createProblem(data: CreateProblemData) {

    return ProblemModel.create(data);
}


export async function findProblems(options: FindProblemsOptions) {

    const { page, limit, difficulty, tag, search, sort, order, status } = options;

    const filter: Record<string, unknown> = {};

    if (difficulty) {
        filter.difficulty = difficulty;
    }

    if (tag) {
        filter.tags = tag;
    }

    if (search) {
        filter.$text = {
            $search: search,
        };
    }

    if (status) {
        filter.status = status;
    }

    const skip = (page - 1) * limit;

    const sortOrder = order === "asc" ? 1 : -1;

    const [problems, total] = await Promise.all([
        ProblemModel
            .find(filter)
            .sort({
                [sort]: sortOrder,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

        ProblemModel.countDocuments(
            filter
        ),
    ]);


    return {
        problems,
        total,
    };
}


export async function updateProblem(id: string, data: UpdateProblemInput) {

    return ProblemModel.findByIdAndUpdate(
        id,
        {
            $set: data,
        },
        {
            new: true,
            runValidators: true,
        }
    ).lean();
}


export async function updateProblemStatus(id: string, status: "draft" | "published" | "archived") {

    return ProblemModel.findByIdAndUpdate(
        id,
        {
            $set: {
                status,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    ).lean();
}
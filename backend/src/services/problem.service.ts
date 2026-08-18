import mongoose from "mongoose";
import * as problemRepository from "../repositories/problem.repository.js";
import type { CreateProblemInput, } from "../schemas/problem/createProblem.schema.js";
import type { UpdateProblemInput, } from "../schemas/problem/updateProblem.schema.js";
import type { ProblemQueryInput, } from "../schemas/problem/problemQuery.schema.js";
import { AppError } from "../utils/AppError.js";


export async function createProblemService(data: CreateProblemInput, userId: string) {

    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid user ID", 401);
    }

    const existingProblem = await problemRepository.findProblemBySlug(data.slug);

    if (existingProblem) {
        throw new AppError("A problem with this slug already exists", 409);
    }

    const createdBy = new mongoose.Types.ObjectId(userId);

    return problemRepository.createProblem({
        ...data,
        createdBy,
    });
}

export async function getProblemsService(query: ProblemQueryInput) {

    const result = await problemRepository.findProblems({
        page: query.page,
        limit: query.limit,
        difficulty: query.difficulty,
        tag: query.tag,
        search: query.search,
        sort: query.sort,
        order: query.order,
        status: "published",
    });

    const totalPages = Math.ceil(result.total / query.limit);

    // Pagination response
    return {
        problems: result.problems,
        pagination: {
            page: query.page,
            limit: query.limit,
            total: result.total,
            totalPages,
            hasNextPage: query.page < totalPages,
            hasPreviousPage: query.page > 1,
        },
    };
}

export async function getProblemBySlugService(slug: string) {

    const problem = await problemRepository.findProblemBySlug(slug, "published");

    if (!problem) {
        throw new AppError("Problem not found", 404);
    }

    return problem;
}


export async function updateProblemService(problemId: string, data: UpdateProblemInput) {

    if (!mongoose.isValidObjectId(problemId)) {
        throw new AppError("Invalid problem ID", 400);
    }

    const problem = await problemRepository.findProblemById(problemId);

    if (!problem) {
        throw new AppError("Problem not found", 404);
    }

    if (problem.status === "archived") {
        throw new AppError("Archived problems cannot be updated", 400);
    }

    if (data.slug) {
        const existingProblem = await problemRepository.findProblemBySlug(data.slug);

        if (existingProblem && existingProblem._id.toString() !== problemId
        ) {
            throw new AppError("A problem with this slug already exists", 409);
        }
    }

    return problemRepository.updateProblem(
        problemId,
        data
    );
}


export async function publishProblemService(problemId: string) {

    if (!mongoose.isValidObjectId(problemId)) {
        throw new AppError("Invalid problem ID", 400);
    }

    const problem = await problemRepository.findProblemById(problemId);

    if (!problem) {
        throw new AppError("Problem not found", 404);
    }

    if (problem.status === "archived") {
        throw new AppError("Archived problems cannot be published", 400);
    }

    if (problem.status === "published") {
        throw new AppError("Problem is already published", 400);
    }

    return problemRepository.updateProblemStatus(
        problemId,
        "published"
    );
}


export async function archiveProblemService(problemId: string) {

    if (!mongoose.isValidObjectId(problemId)) {
        throw new AppError("Invalid problem ID", 400);
    }

    const problem = await problemRepository.findProblemById(problemId);

    if (!problem) {
        throw new AppError("Problem not found", 404);
    }

    if (problem.status === "archived") {
        throw new AppError("Problem is already archived", 400);
    }

    return problemRepository.updateProblemStatus(problemId, "archived");
}
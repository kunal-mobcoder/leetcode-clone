import mongoose from "mongoose";
import * as problemRepository from "../repositories/problem.repository.js";
import type { CreateProblemInput, } from "../schemas/problem/createProblem.schema.js";
import { AppError } from "../utils/AppError.js";


export async function createProblemService(data: CreateProblemInput, userId: string) {

    const existingProblem = await problemRepository.findProblemBySlug(data.slug);

    if (existingProblem) {
        throw new AppError("A problem with this slug already exists", 409);
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid user ID", 401);
    }

    const createdBy = new mongoose.Types.ObjectId(userId);

    return problemRepository.createProblem({ ...data, createdBy, });
}
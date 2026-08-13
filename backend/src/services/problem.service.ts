import * as problemRepository from "../repositories/problem.repository.js";
import type { CreateProblemInput } from "../schemas/problem/createProblem.schema.js";

export async function createProblemService(data: CreateProblemInput, userId: string) {
    const existingProblem = await problemRepository.findProblemBySlug(data.slug);

    if (existingProblem) {
        throw new Error("A problem with this slug already exists");
    }

    return problemRepository.createProblem({ ...data, createdBy: userId, });
}
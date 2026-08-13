import ProblemModel from "../models/problem.model.js";
import type { CreateProblemInput } from "../schemas/problem/createProblem.schema.js";

export async function findProblemBySlug(slug: string) {
    return ProblemModel.findOne({ slug, });
}


export async function createProblem(data: CreateProblemInput & { createdBy: string; }) {
    return ProblemModel.create(data);
}

// data must have everything required by CreateProblemInput AND it must have a createdBy property that is a string.

// Why not just modify CreateProblemInput?
// Why not put createdBy directly inside CreateProblemInput?

// For example:
// type CreateProblemInput = {
//     title: string;
//     description: string;
//     difficulty: string;
//     createdBy: string;
// };

// Sometimes that's appropriate, but often CreateProblemInput represents data coming from the client/request, while createdBy is something the server determines.
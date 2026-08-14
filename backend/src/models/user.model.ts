import mongoose from "mongoose";

import ProblemModel from "../models/problem.model.js";

import type { CreateProblemInput }
    from "../schemas/problem/createProblem.schema.js";


interface CreateProblemData
    extends CreateProblemInput {

    createdBy: mongoose.Types.ObjectId;
}


export async function findProblemBySlug(
    slug: string
) {
    return ProblemModel.findOne({
        slug,
    });
}


export async function createProblem(
    data: CreateProblemData
) {
    return ProblemModel.create(data);
}
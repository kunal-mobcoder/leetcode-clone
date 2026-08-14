import type { NextFunction, Request, Response, } from "express";
import { createProblemService, } from "../services/problem.service.js";


export async function createProblemController(req: Request, res: Response, next: NextFunction) {
    try {
        const problem = await createProblemService(req.body, req.user!.userId);

        return res.status(201).json({
            message: "Problem created successfully",
            problem: {
                id: problem._id,
                title: problem.title,
                slug: problem.slug,
                description: problem.description,
                difficulty: problem.difficulty,
                tags: problem.tags,
                constraints: problem.constraints,
                examples: problem.examples,
                status: problem.status,
                createdBy: problem.createdBy,
            },
        });

    } catch (error) {
        next(error);
    }
}
import type { Request, Response } from "express";
import type { CreateProblemInput } from "../schemas/problem/createProblem.schema.js";
import { createProblemService, } from "../services/problem.service.js";

export async function createProblemController(req: Request<{}, {}, CreateProblemInput>, res: Response) {
    try {
        const problem = await createProblemService(req.body, req.user!.userId);

        return res.status(201).json({
            message: "Problem created successfully",
            problem,
        });

    } catch (error) {

        console.error("Create problem error:", error);

        if (error instanceof Error && error.message === "A problem with this slug already exists") {
            return res.status(409).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}
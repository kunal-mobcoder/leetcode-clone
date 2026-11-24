import type { NextFunction, Request, Response } from "express";

import {
    createProblemService,
    getProblemsService,
    getProblemBySlugService,
    updateProblemService,
    publishProblemService,
    archiveProblemService,
    getAllProblemsAdminService,
    getProblemByIdAdminService,
    setProblemStatusService,
} from "../services/problem.service.js";

import type { CreateProblemInput, } from "../schemas/problem/createProblem.schema.js";

import type { UpdateProblemInput, } from "../schemas/problem/updateProblem.schema.js";

import type { ProblemQueryInput, } from "../schemas/problem/problemQuery.schema.js";


export async function createProblemController(req: Request<{}, {}, CreateProblemInput>, res: Response, next: NextFunction) {

    try {
        const problem = await createProblemService(req.body, req.user!.userId);

        return res.status(201).json({
            message: "Problem created successfully",
            problem,
        });

    } catch (error) {
        next(error);
    }
}


export async function getProblemsController(req: Request, res: Response, next: NextFunction) {
    try {
        const query = req.validatedQuery as ProblemQueryInput;
        const result = await getProblemsService(query);

        return res.status(200).json(result);

    } catch (error) {
        next(error);
    }
}

export async function getProblemBySlugController(req: Request<{ slug: string }>, res: Response, next: NextFunction) {

    try {
        const problem = await getProblemBySlugService(req.params.slug);

        return res.status(200).json({
            problem,
        });

    } catch (error) {
        next(error);
    }
}

export async function updateProblemController(req: Request<{ id: string }, {}, UpdateProblemInput>, res: Response, next: NextFunction) {

    try {
        const problem = await updateProblemService(req.params.id, req.body);

        return res.status(200).json({
            message: "Problem updated successfully",
            problem,
        });

    } catch (error) {
        next(error);
    }
}

export async function publishProblemController(req: Request<{ id: string }>, res: Response, next: NextFunction) {

    try {
        const problem = await publishProblemService(req.params.id);

        return res.status(200).json({
            message: "Problem published successfully",
            problem,
        });

    } catch (error) {
        next(error);
    }
}


export async function archiveProblemController(req: Request<{ id: string }>, res: Response, next: NextFunction) {

    try {
        await archiveProblemService(req.params.id);

        return res.status(200).json({
            message: "Problem archived successfully",
        });

    } catch (error) {
        next(error);
    }
}

export async function getAllProblemsAdminController(req: Request, res: Response, next: NextFunction) {
    try {
        const query = (req.validatedQuery || req.query) as any;
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 50;
        const result = await getAllProblemsAdminService({
            ...query,
            page,
            limit,
        });

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export async function getProblemByIdAdminController(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
        const problem = await getProblemByIdAdminService(req.params.id);

        return res.status(200).json({
            problem,
        });
    } catch (error) {
        next(error);
    }
}

export async function setProblemStatusController(req: Request<{ id: string }, {}, { status: "draft" | "published" | "archived" }>, res: Response, next: NextFunction) {
    try {
        const problem = await setProblemStatusService(req.params.id, req.body.status);

        return res.status(200).json({
            message: `Problem status updated to ${req.body.status}`,
            problem,
        });
    } catch (error) {
        next(error);
    }
}
import type {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    createSubmissionService,
    getSubmissionByIdService,
} from "../services/submission.service.js";


/**
 * Create a new code submission.
 *
 * POST /api/submissions
 *
 * Authentication:
 * Required
 */
export async function createSubmissionController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const submission = await createSubmissionService(
            req.body,
            req.user!.userId
        );

        return res.status(201).json({
            message: "Submission created successfully",

            submission: {
                id: submission._id,
                problemId: submission.problemId,
                language: submission.language,
                status: submission.status,
                runtime: submission.runtime,
                memory: submission.memory,
                createdAt: submission.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
}


/**
 * Get a submission by ID.
 *
 * GET /api/submissions/:id
 *
 * Authentication:
 * Required
 *
 * Users can only access their own submissions.
 */
export async function getSubmissionByIdController(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = req.params;

        const submission = await getSubmissionByIdService(
            id,
            req.user!.userId
        );

        return res.status(200).json({
            submission,
        });
    } catch (error) {
        next(error);
    }
}
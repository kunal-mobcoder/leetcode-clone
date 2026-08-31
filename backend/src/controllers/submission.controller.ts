import type {
    Request,
    Response,
    NextFunction,
} from "express";


import type { SubmissionQuery } from "../schemas/submission/submissionQuery.schema.js";

import {
    createSubmissionService,
    getSubmissionByIdService,
    getUserSubmissionsService,
    getMySubmissionsService
} from "../services/submission.service.js";

/**
 * Create a new code submission.
 *
 * POST /api/submissions
 *
 * Authentication: Required
 */
export async function createSubmissionController(
    req: Request,
    res: Response,
    next: NextFunction
) {

    try {

        const submission =
            await createSubmissionService(
                req.body,
                req.user!.userId
            );


        return res.status(201).json({

            message:
                "Submission created successfully",

            submission: {

                id: submission._id,

                problemId:
                    submission.problemId,

                language:
                    submission.language,

                status:
                    submission.status,

                runtime:
                    submission.runtime,

                memory:
                    submission.memory,

                createdAt:
                    submission.createdAt,
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
 * Authentication: Required
 *
 * Users can only access their own submissions.
 */
export async function getSubmissionByIdController(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) {

    try {

        const {
            id,
        } = req.params;


        const submission =
            await getSubmissionByIdService(
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


/**
 * Get all submissions belonging to
 * the authenticated user.
 *
 * GET /api/submissions/my
 *
 * Authentication: Required
 *
 * Supports pagination:
 *
 * ?page=1&limit=20
 */
export async function getMySubmissionsController(
    req: Request,
    res: Response,
    next: NextFunction
) {

    try {

        const query =
            req.query as unknown as SubmissionQuery;


        const result =
            await getMySubmissionsService(
                req.user!.userId,
                query
            );


        return res.status(200).json(
            result
        );

    } catch (error) {

        next(error);
    }
}

/**
 * Get the authenticated user's submissions.
 *
 * GET /api/submissions/my
 *
 * Authentication: Required
 *
 * Supports:
 * - Pagination
 * - Filtering by problem
 */
export async function getUserSubmissionsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const {
            page,
            limit,
            problemId,
        } = req.validatedQuery as {
            page: number;
            limit: number;
            problemId?: string;
        };

        const result =
            await getUserSubmissionsService(
                req.user!.userId,
                page,
                limit,
                problemId
            );

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}
import type { Request, Response, NextFunction, } from "express";

import {
    createTestCaseService,
    getTestCasesByProblemService,
    getPublicTestCasesByProblemService,
    updateTestCaseService,
    deleteTestCaseService,
} from "../services/testCase.service.js";

import type { CreateTestCaseInput, } from "../schemas/testCase/createTestCase.schema.js";

import type { UpdateTestCaseInput, } from "../schemas/testCase/updateTestCase.schema.js";


/**
 * POST /api/problems/:problemId/test-cases
 *
 * Create a new test case for a problem.
 *
 * Access: Admin
 */
export async function createTestCaseController(
    req: Request<{
        problemId: string;
    }, {}, CreateTestCaseInput>,
    res: Response,
    next: NextFunction
) {

    try {
        const { problemId, } = req.params;

        const testCase = await createTestCaseService(problemId, req.body);

        return res.status(201).json({
            message: "Test case created successfully",
            testCase,
        });

    } catch (error) {
        next(error);
    }
}


/**
 * GET /api/problems/:problemId/test-cases
 *
 * Get all test cases belonging to a problem.
 *
 * This endpoint is intended for administrators.
 *
 * Access: Admin
 */
export async function getTestCasesController(
    req: Request<{
        problemId: string;
    }>,
    res: Response,
    next: NextFunction
) {

    try {
        const { problemId, } = req.params;

        const testCases = await getTestCasesByProblemService(problemId);

        return res.status(200).json({
            testCases,
        });

    } catch (error) {
        next(error);
    }
}


/**
 * GET /api/problems/:problemId/test-cases/public
 *
 * Get only public test cases belonging to a problem.
 *
 * Hidden test cases are never returned.
 *
 * Access: Public
 */
export async function getPublicTestCasesController(
    req: Request<{
        problemId: string;
    }>,
    res: Response,
    next: NextFunction
) {

    try {
        const { problemId } = req.params;

        const testCases = await getPublicTestCasesByProblemService(problemId);

        return res.status(200).json({
            testCases,
        });

    } catch (error) {
        next(error);
    }
}


/**
 * PATCH /api/problems/:problemId/test-cases/:testCaseId
 *
 * Update an existing test case.
 *
 * Access: Admin
 */
export async function updateTestCaseController(
    req: Request<
        {
            problemId: string;
            testCaseId: string;
        },
        {},
        UpdateTestCaseInput
    >,
    res: Response,
    next: NextFunction
) {

    try {
        const { problemId, testCaseId, } = req.params;

        const testCase = await updateTestCaseService(problemId, testCaseId, req.body);

        return res.status(200).json({
            message: "Test case updated successfully",
            testCase,
        });

    } catch (error) {
        next(error);
    }
}


/**
 * DELETE /api/problems/:problemId/test-cases/:testCaseId
 *
 * Delete an existing test case.
 *
 * Access: Admin
 */
export async function deleteTestCaseController(
    req: Request<{
        problemId: string;
        testCaseId: string;
    }>,
    res: Response,
    next: NextFunction
) {

    try {
        const { problemId, testCaseId } = req.params;

        await deleteTestCaseService(problemId, testCaseId);

        return res.status(200).json({
            message: "Test case deleted successfully",
        });

    } catch (error) {
        next(error);
    }
}
import { Router } from "express";

import authenticate
    from "../middleware/auth.middleware.js";

import {
    authorizeRoles,
} from "../middleware/authorize.middleware.js";

import {
    validateBody,
} from "../middleware/validate.middleware.js";

import {
    createTestCaseController,
    getTestCasesController,
    getPublicTestCasesController,
    updateTestCaseController,
    deleteTestCaseController,
} from "../controllers/testCase.controller.js";

import {
    createTestCaseSchema,
} from "../schemas/testCase/createTestCase.schema.js";

import {
    updateTestCaseSchema,
} from "../schemas/testCase/updateTestCase.schema.js";


const router = Router({
    mergeParams: true,
});


/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/


/**
 * GET /api/problems/:problemId/test-cases/public
 *
 * Get public test cases for a problem.
 *
 * Hidden test cases are never exposed.
 *
 * Access: Public
 */
router.get(
    "/public",
    getPublicTestCasesController
);


/*
|--------------------------------------------------------------------------
| Admin routes
|--------------------------------------------------------------------------
*/


/**
 * GET /api/problems/:problemId/test-cases
 *
 * Get all test cases for a problem.
 *
 * Includes hidden test cases.
 *
 * Access: Admin
 */
router.get(
    "/",
    authenticate,
    authorizeRoles("admin"),
    getTestCasesController
);


/**
 * POST /api/problems/:problemId/test-cases
 *
 * Create a new test case.
 *
 * Access: Admin
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("admin"),
    validateBody(createTestCaseSchema),
    createTestCaseController
);


/**
 * PATCH /api/problems/:problemId/test-cases/:testCaseId
 *
 * Update a test case.
 *
 * Access: Admin
 */
router.patch(
    "/:testCaseId",
    authenticate,
    authorizeRoles("admin"),
    validateBody(updateTestCaseSchema),
    updateTestCaseController
);


/**
 * DELETE /api/problems/:problemId/test-cases/:testCaseId
 *
 * Delete a test case.
 *
 * Access: Admin
 */
router.delete(
    "/:testCaseId",
    authenticate,
    authorizeRoles("admin"),
    deleteTestCaseController
);


export default router;
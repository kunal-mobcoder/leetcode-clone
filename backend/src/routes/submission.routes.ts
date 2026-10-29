import { Router } from "express";

import authenticate
    from "../middleware/auth.middleware.js";

import {
    validateBody,
    validateQuery,
} from "../middleware/validate.middleware.js";

import {
    createSubmissionSchema,
} from "../schemas/submission/createSubmission.schema.js";

import {
    runCodeSchema,
} from "../schemas/submission/runCode.schema.js";

import {
    submissionQuerySchema,
} from "../schemas/submission/submissionQuery.schema.js";

import {
    createSubmissionController,
    getSubmissionByIdController,
    getMySubmissionsController,
    runCodeController,
} from "../controllers/submission.controller.js";

import { codeExecutionLimiter } from "../middleware/rateLimit.middleware.js";


const router = Router();


/*
|--------------------------------------------------------------------------
| Submission Routes
|--------------------------------------------------------------------------
|
| Base URL:
|
| /api/submissions
|
*/


/**
 * @route POST /api/submissions
 * @description Create a new code submission (judge via BullMQ)
 * @access Authenticated users
 * @rateLimit 15 req / min / IP
 */
router.post(
    "/",
    codeExecutionLimiter,
    authenticate,
    validateBody(createSubmissionSchema),
    createSubmissionController
);


/**
 * @route POST /api/submissions/run
 * @description Test code execution synchronously against sample or custom test cases
 * @access Public / Authenticated
 * @rateLimit 15 req / min / IP
 */
router.post(
    "/run",
    codeExecutionLimiter,
    validateBody(runCodeSchema),
    runCodeController
);


/**
 * @route GET /api/submissions/my
 * @description Get submissions belonging to the authenticated user
 * @access Authenticated users
 *
 * Supports pagination:
 *
 * ?page=1&limit=20
 * ?page=1&limit=20&problemId=<id>
 */
router.get(
    "/my",
    authenticate,
    validateQuery(submissionQuerySchema),
    getMySubmissionsController
);


/**
 * @route GET /api/submissions/:id
 * @description Get a submission by ID
 * @access Authenticated users
 *
 * Users can only access their own submissions.
 */
router.get(
    "/:id",
    authenticate,
    getSubmissionByIdController
);


export default router;

import { Router } from "express";

import authenticate
    from "../middleware/auth.middleware.js";

import {
    validateBody,
} from "../middleware/validate.middleware.js";

import {
    createSubmissionSchema,
} from "../schemas/submission/createSubmission.schema.js";

import {
    createSubmissionController,
    getSubmissionByIdController,
} from "../controllers/submission.controller.js";


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
 * @description Create a new code submission
 * @access Authenticated users
 *
 * The user ID comes from the authenticated JWT.
 */
router.post(
    "/",
    authenticate,
    validateBody(createSubmissionSchema),
    createSubmissionController
);


/**
 * @route GET /api/submissions/:id
 * @description Get a user's submission by ID
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
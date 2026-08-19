import { Router } from "express";

import {
    createProblemController,
    getProblemsController,
    getProblemBySlugController,
    updateProblemController,
    publishProblemController,
    archiveProblemController,
} from "../controllers/problem.controller.js";

import authenticate from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { validateBody, validateQuery, } from "../middleware/validate.middleware.js";
import { createProblemSchema } from "../schemas/problem/createProblem.schema.js";
import { problemQuerySchema } from "../schemas/problem/problemQuery.schema.js";
import { updateProblemSchema } from "../schemas/problem/updateProblem.schema.js";


const router = Router();


// Public problem routes
// Base URL: /api/problems

/**
 * @route   GET /api/problems
 * @desc    Get a paginated list of published problems
 * @access  Public
 *
 * Supports filtering, searching, sorting and pagination.
 */
router.get("/", validateQuery(problemQuerySchema), getProblemsController);


/**
 * @route   GET /api/problems/:slug
 * @desc    Get a published problem by its slug
 * @access  Public
 */
router.get("/:slug", getProblemBySlugController);


// Admin problem routes

/**
 * @route   POST /api/problems
 * @desc    Create a new problem
 * @access  Private - Admin only
 *
 * Newly created problems start with "draft" status.
 */
router.post("/", authenticate, authorizeRoles("admin"), validateBody(createProblemSchema), createProblemController);


/**
 * @route   PATCH /api/problems/:id
 * @desc    Update an existing problem
 * @access  Private - Admin only
 *
 * Archived problems cannot be updated.
 */
router.patch("/:id", authenticate, authorizeRoles("admin"), validateBody(updateProblemSchema), updateProblemController);


/**
 * @route   PATCH /api/problems/:id/publish
 * @desc    Publish a draft problem
 * @access  Private - Admin only
 *
 * Changes problem status from "draft" to "published".
 */
router.patch("/:id/publish", authenticate, authorizeRoles("admin"), publishProblemController);


/**
 * @route   DELETE /api/problems/:id
 * @desc    Archive a problem
 * @access  Private - Admin only
 *
 * This is a soft delete.
 * The problem is not physically removed from MongoDB.
 * Its status becomes "archived".
 */
router.delete("/:id", authenticate, authorizeRoles("admin"), archiveProblemController);


export default router;
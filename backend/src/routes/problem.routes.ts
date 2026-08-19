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
import { createProblemSchema, } from "../schemas/problem/createProblem.schema.js";
import { problemQuerySchema, } from "../schemas/problem/problemQuery.schema.js";
import { updateProblemSchema, } from "../schemas/problem/updateProblem.schema.js";


const router = Router();


// Public routes
router.get("/", validateQuery(problemQuerySchema), getProblemsController);

router.get("/:slug", getProblemBySlugController);


// Admin routes
router.post("/", authenticate, authorizeRoles("admin"), validateBody(createProblemSchema), createProblemController);

router.patch("/:id", authenticate, authorizeRoles("admin"), validateBody(updateProblemSchema), updateProblemController);

router.patch("/:id/publish", authenticate, authorizeRoles("admin"), publishProblemController);

router.delete("/:id", authenticate, authorizeRoles("admin"), archiveProblemController);


export default router;
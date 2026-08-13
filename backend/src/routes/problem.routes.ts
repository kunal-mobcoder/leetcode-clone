import { Router } from "express";
import { createProblemController, } from "../controllers/problem.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import { authorizeRoles, } from "../middleware/authorize.middleware.js";
import validateBody from "../middleware/validate.middleware.js";
import { createProblemSchema, } from "../schemas/problem/createProblem.schema.js";

const router = Router();

router.post("/", validateBody(createProblemSchema), authenticate, authorizeRoles("admin"), createProblemController);

export default router;
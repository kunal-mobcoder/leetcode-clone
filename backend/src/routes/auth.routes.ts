import { Router } from "express";
import {
    registerUserController,
    loginUserController,
    logoutUserController,
    refreshTokenController,
} from "../controllers/auth.controller.js";
import { registerSchema } from "../schemas/auth/register.schema.js";
import { loginSchema } from "../schemas/auth/login.schema.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";


const router = Router();


/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 * @rateLimit 10 req / 15 min / IP
 */
router.post(
    "/register",
    authLimiter,
    validateBody(registerSchema),
    registerUserController
);


/**
 * @route POST /api/auth/login
 * @description Login user with email and password
 * @access Public
 * @rateLimit 10 req / 15 min / IP
 */
router.post(
    "/login",
    authLimiter,
    validateBody(loginSchema),
    loginUserController
);


/**
 * @route POST /api/auth/refresh
 * @description Refresh the access token using the HttpOnly refresh cookie
 * @access Public
 */
router.post("/refresh", refreshTokenController);


/**
 * @route POST /api/auth/logout
 * @description Logout a user (clears refresh-token cookie)
 * @access Public
 */
router.post("/logout", logoutUserController);
router.get("/logout", logoutUserController);


export default router;

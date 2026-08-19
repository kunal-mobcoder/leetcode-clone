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


const router = Router();


// Authentication routes
// Base URL: /api/auth

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validateBody(registerSchema), registerUserController);


/**
 * @route   POST /api/auth/login
 * @desc    Login an existing user
 * @access  Public
 */
router.post("/login", validateBody(loginSchema), loginUserController);


/**
 * @route   POST /api/auth/refresh
 * @desc    Generate a new access token using the refresh token
 * @access  Public
 *
 * The refresh token is read from the HttpOnly cookie.
 */
router.post("/refresh", refreshTokenController);


/**
 * @route   POST /api/auth/logout
 * @desc    Logout the current session
 * @access  Public
 *
 * The refresh token is read from the HttpOnly cookie
 * and the corresponding server-side session is revoked.
 */
router.post("/logout", logoutUserController);


export default router;
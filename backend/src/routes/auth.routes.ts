import { Router } from "express";
import { registerUserController, loginUserController, logoutUserController, refreshTokenController } from "../controllers/auth.controller.js";
import { registerSchema } from "../schemas/auth/register.schema.js";
import { loginSchema } from "../schemas/auth/login.schema.js";
import validateBody from "../middleware/validate.middleware.js";


const authRouter = Router()


/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register", validateBody(registerSchema), registerUserController)


/**
 * @route POST /api/auth/login
 * @description Login user with email and password
 * @access Public
 */
authRouter.post("/login", validateBody(loginSchema), loginUserController)


/**
 * @route POST /api/auth/refresh
 * @description Refresh the token
 * @access Public
 */
authRouter.post("/refresh", refreshTokenController);


/**
 * @route POST /api/auth/register
 * @description Logout a user
 * @access Public
 */
authRouter.post("/logout", logoutUserController);


export default authRouter
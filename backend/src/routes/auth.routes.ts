import { Router } from "express";
import { registerUserController, loginUserController } from "../controllers/auth.controller.js";
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


export default authRouter
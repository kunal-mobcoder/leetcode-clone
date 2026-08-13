import { Request, Response } from "express";

import { registerUser, loginUser, refreshAccessToken, logoutUser, } from "../services/auth.service.js";

import { refreshTokenCookieOptions } from "../config/cookie.js";

import type { RegisterInput } from "../schemas/auth/register.schema.js";
import type { LoginInput } from "../schemas/auth/login.schema.js";

async function registerUserController(req: Request<{}, {}, RegisterInput>, res: Response) {
    try {
        const { username, email, password, } = req.body;

        const result = await registerUser(username, email, password, {
            ip: req.ip || "unknown",
            userAgent: req.get("user-agent") || "unknown",
        });

        res.cookie(
            "refreshToken",
            result.refreshToken,
            refreshTokenCookieOptions
        );

        return res.status(201).json({
            message: "User registered successfully",
            accessToken: result.accessToken,
            user: result.user,
        });

    } catch (error) {
        console.error("Register controller error:", error);

        if (error instanceof Error && error.message === "Username or email already exists") {
            return res.status(409).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

async function loginUserController(req: Request<{}, {}, LoginInput>, res: Response) {
    try {
        const { email, password, } = req.body;

        const result = await loginUser(email, password, {
            ip: req.ip || "unknown",
            userAgent: req.get("user-agent") || "unknown",
        });

        res.cookie(
            "refreshToken",
            result.refreshToken,
            refreshTokenCookieOptions
        );

        return res.status(200).json({
            message: "User logged in successfully",
            accessToken: result.accessToken,
            user: result.user,
        });

    } catch (error) {
        console.error("Login controller error:", error);

        if (error instanceof Error && error.message === "Invalid email or password") {
            return res.status(401).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

async function refreshTokenController(req: Request, res: Response) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token not found",
            });
        }

        const result = await refreshAccessToken(refreshToken, {
            ip: req.ip || "unknown",
            userAgent: req.get("user-agent") || "unknown",
        });

        res.cookie(
            "refreshToken",
            result.refreshToken,
            refreshTokenCookieOptions
        );

        return res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken: result.accessToken,
        });

    } catch (error) {
        console.error("Refresh token controller error:", error);

        res.clearCookie("refreshToken", refreshTokenCookieOptions);

        if (error instanceof Error && (
            error.message === "Invalid refresh token" || error.message === "Refresh token expired"
        )) {
            return res.status(401).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

async function logoutUserController(req: Request, res: Response) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(200).json({
                message: "Logged out successfully",
            });
        }

        await logoutUser(refreshToken);

        res.clearCookie(
            "refreshToken",
            refreshTokenCookieOptions
        );

        return res.status(200).json({
            message: "Logged out successfully",
        });

    } catch (error) {
        console.error("Logout controller error:", error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

async function logoutFromAllUserController(req: Request, res: Response) {

}


export {
    registerUserController,
    loginUserController,
    refreshTokenController,
    logoutUserController,
    logoutFromAllUserController
};
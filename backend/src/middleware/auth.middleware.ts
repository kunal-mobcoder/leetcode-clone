import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import type { AccessTokenPayload } from "../types/auth.js";


function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({
                message: "Invalid authorization header",
            });
        }

        const decoded = jwt.verify(token, env.ACCESS_TOKEN_PRIVATE_KEY);


        if (typeof decoded !== "object" || decoded === null || !("userId" in decoded) || !("roles" in decoded)) {
            return res.status(401).json({
                message: "Invalid access token",
            });
        }

        const payload: AccessTokenPayload = {
            userId: String(decoded.userId),
            roles: decoded.roles as AccessTokenPayload["roles"],
        };

        req.user = payload;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired access token",
        });
    }
}

export default authenticate
import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import env from "../config/env.js";
import { AccessTokenPayload } from "../types/auth.js";

export function generateAccessToken(
    payload: AccessTokenPayload
): string {
    return jwt.sign(
        payload,
        env.ACCESS_TOKEN_PRIVATE_KEY,
        {
            expiresIn: "15m",
        }
    );
}

export function generateRefreshToken(): string {
    return crypto
        .randomBytes(64)
        .toString("hex");
}

export function hashRefreshToken(
    refreshToken: string
): string {
    return crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
}
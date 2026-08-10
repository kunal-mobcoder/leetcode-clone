import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { AccessTokenPayload } from "../types/auth.js";

export function generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(
        payload,
        env.ACCESS_TOKEN_PRIVATE_KEY,
        {
            expiresIn: "15m",
        }
    );
}
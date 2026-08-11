import SessionModel from "../models/session.model.js";
import { hashRefreshToken } from "./generateToken.js";

async function verifyRefreshToken(refreshToken: string) {
    if (!refreshToken) {
        throw new Error("Refresh token is required");
    }

    const refreshTokenHash = hashRefreshToken(refreshToken);

    const session = await SessionModel.findOne({
        refreshTokenHash,
    });

    if (!session) {
        throw new Error("Invalid refresh token");
    }

    if (session.revokedAt) {
        throw new Error("Refresh token has been revoked");
    }

    if (session.expiresAt.getTime() <= Date.now()) {
        throw new Error("Refresh token has expired");
    }

    return session;
}

export default verifyRefreshToken;
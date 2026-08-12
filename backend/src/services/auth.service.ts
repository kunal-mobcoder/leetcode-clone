import bcrypt from "bcryptjs";

import userRepository from "../repositories/user.repository.js";
import sessionRepository from "../repositories/session.repository.js";

import { generateAccessToken, generateRefreshToken, hashRefreshToken, } from "../utils/generateToken.js";

interface SessionContext {
    ip: string;
    userAgent: string;
}

const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7;

function getRefreshTokenExpiry(): Date {
    return new Date(
        Date.now() + REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
    );
}

export async function registerUser(username: string, email: string, password: string, context: SessionContext) {
    const existingUser = await userRepository.findByEmailOrUsername(email, username);

    if (existingUser) {
        throw new Error(
            "Username or email already exists"
        );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await userRepository.create({ username, email, password: hashedPassword, });

    const accessToken = generateAccessToken({
        userId: user._id.toString(),
        roles: user.roles,
    });

    const refreshToken = generateRefreshToken();

    const refreshTokenHash = hashRefreshToken(refreshToken);

    await sessionRepository.create({
        userId: user._id.toString(),
        refreshTokenHash,
        ip: context.ip,
        userAgent: context.userAgent,
        expiresAt: getRefreshTokenExpiry(),
    });

    return {
        accessToken,
        refreshToken,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            roles: user.roles,
        },
    };
}

export async function loginUser(email: string, password: string, context: SessionContext) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
        throw new Error("Invalid email or password");
    }

    const accessToken = generateAccessToken({
        userId: user._id.toString(),
        roles: user.roles,
    });

    const refreshToken = generateRefreshToken();

    const refreshTokenHash = hashRefreshToken(refreshToken);

    await sessionRepository.create({
        userId: user._id.toString(),
        refreshTokenHash,
        ip: context.ip,
        userAgent: context.userAgent,
        expiresAt: getRefreshTokenExpiry(),
    });

    return {
        accessToken,
        refreshToken,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            roles: user.roles,
        },
    };
}

export async function refreshAccessToken(refreshToken: string, context: SessionContext) {
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const session = await sessionRepository.findValidSession(refreshTokenHash);

    if (!session) {
        throw new Error("Invalid refresh token");
    }

    if (session.expiresAt.getTime() <= Date.now()) {
        await sessionRepository.revokeSessionById(session._id.toString());

        throw new Error("Refresh token expired");
    }

    const user = await userRepository.findById(session.userId.toString());

    if (!user) {
        throw new Error("User not found");
    }

    const accessToken = generateAccessToken({
        userId: user._id.toString(),
        roles: user.roles,
    });


    const newRefreshToken = generateRefreshToken();

    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);


    await sessionRepository.revokeSessionById(session._id.toString());

    await sessionRepository.create({
        userId: user._id.toString(),
        refreshTokenHash: newRefreshTokenHash,
        ip: context.ip,
        userAgent: context.userAgent,
        expiresAt: getRefreshTokenExpiry(),
    });

    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
}

export async function logoutUser(refreshToken: string) {
    const refreshTokenHash = hashRefreshToken(refreshToken);

    await sessionRepository.revokeSession(refreshTokenHash);
}
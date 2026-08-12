import type { CookieOptions } from "express";

export const refreshTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
}
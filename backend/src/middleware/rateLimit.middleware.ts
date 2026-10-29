/**
 * Rate Limiter Middleware
 *
 * Protects expensive endpoints from abuse / DoS.
 * Uses in-memory store by default (suitable for a single-node
 * deployment). For multi-node production, swap the store for
 * `rate-limit-redis` backed by the shared Redis instance.
 */

import { rateLimit } from "express-rate-limit";


// ---------------------------------------------------------------------------
// Code execution limiter
// Protects Docker-based code run/submit endpoints which are
// resource-intensive and easiest to abuse.
// ---------------------------------------------------------------------------

/** 15 requests per minute per IP for /run and POST /submissions */
export const codeExecutionLimiter = rateLimit({
    windowMs: 60 * 1000,     // 1 minute window
    limit: 15,               // max 15 requests per window per IP
    standardHeaders: "draft-8",  // Return standard `RateLimit-*` headers
    legacyHeaders: false,
    message: {
        error: "Too many code execution requests. Please wait a moment before trying again.",
    },
    // Skip rate limiting in test environment
    skip: () => process.env.NODE_ENV === "test",
});


// ---------------------------------------------------------------------------
// Auth limiter
// Protects login/signup from brute-force attacks.
// ---------------------------------------------------------------------------

/** 10 auth attempts per 15 minutes per IP */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minute window
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        error: "Too many authentication attempts. Please try again later.",
    },
    skip: () => process.env.NODE_ENV === "test",
});


// ---------------------------------------------------------------------------
// General API limiter
// Light global fallback for all other routes.
// ---------------------------------------------------------------------------

/** 200 requests per minute per IP for general API usage */
export const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 200,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        error: "Too many requests. Please slow down.",
    },
    skip: () => process.env.NODE_ENV === "test",
});

/**
 * Health Check Controller
 *
 * GET /health
 *
 * Returns the live status of each external dependency so
 * load-balancers, Docker HEALTHCHECK, and monitoring tools
 * can verify the service is ready to serve traffic.
 *
 * Response shape:
 * {
 *   "status": "ok" | "degraded",
 *   "uptime": 123.45,
 *   "timestamp": "2026-10-28T12:00:00.000Z",
 *   "services": {
 *     "mongodb": "ok" | "error",
 *     "redis": "ok" | "error"
 *   }
 * }
 */

import type { Request, Response } from "express";
import mongoose from "mongoose";
import redisClient from "../config/redis.js";


export async function healthController(
    _req: Request,
    res: Response
): Promise<void> {

    const services: Record<string, "ok" | "error"> = {};

    // ---- MongoDB ----
    // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    services.mongodb = mongoose.connection.readyState === 1 ? "ok" : "error";

    // ---- Redis ----
    try {
        await redisClient.ping();
        services.redis = "ok";
    } catch {
        services.redis = "error";
    }

    const allHealthy = Object.values(services).every((s) => s === "ok");

    const statusCode = allHealthy ? 200 : 503;
    const overallStatus = allHealthy ? "ok" : "degraded";

    res.status(statusCode).json({
        status: overallStatus,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        services,
    });
}

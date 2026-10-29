import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import testCaseRoutes from "./routes/testCase.routes.js";
import submissionRoutes from "./routes/submission.routes.js";

import { errorMiddleware } from "./middleware/error.middleware.js";
import { generalLimiter } from "./middleware/rateLimit.middleware.js";
import { healthController } from "./controllers/health.controller.js";


const app = express();

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
app.use(
    cors({
        origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
        credentials: true,
    })
);

// ---------------------------------------------------------------------------
// Body parsing
// ---------------------------------------------------------------------------
app.use(cookieParser());
app.use(express.json({ limit: "10KB" }));

// ---------------------------------------------------------------------------
// Global rate limiter (light — heavy limiters are applied per-route)
// ---------------------------------------------------------------------------
app.use(generalLimiter);

// ---------------------------------------------------------------------------
// Health check — no auth, no rate limit (load-balancer probes this)
// ---------------------------------------------------------------------------
app.get("/health", healthController);
app.get("/api/health", healthController);

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/problems/:problemId/test-cases", testCaseRoutes);

// ---------------------------------------------------------------------------
// Error handler (must be last)
// ---------------------------------------------------------------------------
app.use(errorMiddleware);

export default app;

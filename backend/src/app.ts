import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import problemRoutes from "./routes/problem.routes.js";

import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();


// -------------- Global middleware --------------

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse cookies from incoming requests
app.use(cookieParser());

// Parse JSON request bodies
// Limit request body size to 10KB
app.use(express.json({ limit: "10KB" }));


// ---------------- API routes --------------------

// Authentication routes
// Base URL: /api/auth
app.use("/api/auth", authRoutes);

// User-related routes
// Base URL: /api/users
app.use("/api/users", userRoutes);

// Problem-related routes
// Base URL: /api/problems
app.use("/api/problems", problemRoutes);


// -------------- Global error handler ---------------

app.use(errorMiddleware);

export default app;
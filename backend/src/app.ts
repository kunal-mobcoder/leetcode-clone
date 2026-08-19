import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import { errorMiddleware, } from "./middleware/error.middleware.js";


const app = express()

app.use(cors())
app.use(cookieParser());
app.use(express.json({ limit: '10KB' }))


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/problems", problemRoutes);


app.use(errorMiddleware);

export default app
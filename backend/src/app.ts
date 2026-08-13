import cors from "cors"
import express from "express"
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js";
import problemRoutes from "./routes/problem.routes.js"


const app = express()

app.use(cors())
app.use(cookieParser());
app.use(express.json({ limit: '10KB' }))


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/problems", problemRoutes);

export default app
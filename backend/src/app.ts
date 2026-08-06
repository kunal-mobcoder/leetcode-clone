import express from "express"
import cors from "cors"
import authRouter from "./routes/auth.routes.js"

const app = express()


app.use(cors())
app.use(express.json({ limit: '10KB' }))


app.use("/api/auth", authRouter)
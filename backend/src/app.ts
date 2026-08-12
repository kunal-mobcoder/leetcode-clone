import cors from "cors"
import express from "express"
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js"


const app = express()


app.use(cors())
app.use(cookieParser());
app.use(express.json({ limit: '10KB' }))



app.use("/api/auth", authRouter)


export default app
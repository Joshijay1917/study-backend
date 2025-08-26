import express from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config({
    path: './.env'
})

const app = express();

console.log("cors=", process.env.CORS_ORIGIN);

app.use(cors({
    origin: process.env.CORS_ORIGIN
}))

import photoRouter from "./routes/photos.routes.js";

app.use("/api/v1/photo", photoRouter)

export { app }
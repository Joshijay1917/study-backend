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

//Routes
// import photoRouter from "./routes/photos.routes.js";
import subjectRouter from "./routes/subject.routes.js";
import assignmentRouter from "./routes/assignment.routes.js";
import labRouter from "./routes/labManual.routes.js";
import noteRouter from "./routes/notes.routes.js";

// app.use("/api/v1/photo", photoRouter)
app.use("/api/v1/subject", subjectRouter)
app.use("/api/v1/assignment", assignmentRouter)
app.use("/api/v1/labmanual", labRouter)
app.use("/api/v1/notes", noteRouter)

export { app }
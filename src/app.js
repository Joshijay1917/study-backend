import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

console.log("cors=", process.env.CORS_ORIGIN);

app.use(cors({
  origin: ["http://localhost:5173", process.env.CORS_ORIGIN],
  credentials: true
}));
app.use(express.json({ limit: '1mb'}));
app.use(cookieParser());

//Routes
import userRouter from "./routes/user.routes.js"
import subjectRouter from "./routes/subject.routes.js";
import assignmentRouter from "./routes/assignment.routes.js";
import labRouter from "./routes/labManual.routes.js";
import noteRouter from "./routes/notes.routes.js";
import lastUpdateRouter from "./routes/lastUpdate.routes.js"
import { errorHandler } from "./middleware/errorHandler.middleware.js";

app.use("/api/v1/user", userRouter)
app.use("/api/v1/subject", subjectRouter)
app.use("/api/v1/assignment", assignmentRouter)
app.use("/api/v1/labmanual", labRouter)
app.use("/api/v1/notes", noteRouter)
app.use("/api/v1/latestUpdates", lastUpdateRouter)

app.use(errorHandler)

export { app }
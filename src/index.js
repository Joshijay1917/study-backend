import { app } from "./app.js";
import { connectDB } from "./db/index.js"
import dotenv from "dotenv"

dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT || 8000

console.log("PORT=", PORT);

connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log("Server is running on port ", PORT);
    })
    
    app.on("error", (err) => {
        console.log("Error in express app: ", err);
    })
})
.catch((err) => {
    console.log("Cannot connect to database ", err);
})
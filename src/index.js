import { app } from "./app.js";

const PORT = process.env.PORT || 8000

console.log("PORT=", PORT);


app.listen(PORT, () => {
    console.log("Server is running on port ", PORT);
})

app.on("error", (err) => {
    console.log("Error in express app: ", err);
})
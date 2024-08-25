import dotenv from "dotenv"
import { app } from "./app.js";

dotenv.config({path: "./.env"})
const PORT = process.env.PORT || 8002;

// Server Listening
app.listen(PORT,() => {
    console.log(`Server listening at PORT: ${PORT}`)
})
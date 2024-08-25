import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./db/index.js";

dotenv.config({ path: "./.env" });
const PORT = process.env.PORT || 8002;

// Database Connection
connectDB()
  .then(() => {
    // Server Listening
    app.listen(PORT, () => {
      console.log(`Server listening at PORT: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error", error);
  });

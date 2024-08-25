import mongoose from "mongoose"
import {DB_NAME} from "../constants.js"

export const connectDB = async () => {
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
       console.log(`\n MongoDB connected ! DB host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB Connection error",error);
        process.exit(1);
    }
}
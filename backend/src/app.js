import express from "express";
import cors from "cors"

// Initializing the Express application
const app = express();

// Configuring CORS middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// Middleware to parse JSON bodies with a size limit of 16kb
app.use(express.json({
    limit: "16kb"
}))

// Middleware to parse URL-encoded bodies with extended option enabled
app.use(express.urlencoded({
    extended:true
}))

// Serving static files from the "public" directory
app.use(express.static("public"))

export { app };
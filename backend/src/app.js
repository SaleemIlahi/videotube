import express from "express";
import cors from "cors"
import helathcheckRouter from "./routes/healthcheck.routes.js";
import logger from "./utils/logger.js";
import morgan from "morgan";

// Initializing the Express application
const app = express();

// Configuring logger Middleware 
const morganFormat = ":method :url :status :response-time ms";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

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

// Router config
app.use("/api/v1/healthcheck",helathcheckRouter)

export { app };
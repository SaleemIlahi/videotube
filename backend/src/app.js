import express from "express";
import cors from "cors";
import helathcheckRouter from "./routes/healthcheck.routes.js";
import logger from "./utils/logger.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
import subscibeRouter from "./routes/subscription.routes.js";
import likeRouter from "./routes/like.routes.js";
import { rateLimit } from "./middlewares/ratelimiter.middlewares.js";

// Initializing the Express application
const app = express();

// Rate limit middle
app.use(rateLimit);

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
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: eval(process.env.CORS_METHODS),
    allowedHeaders: eval(process.env.CORS_HEADERS),
    credentials: true,
  })
);

// Middleware to parse JSON bodies with a size limit of 16kb
app.use(
  express.json({
    limit: "16kb",
  })
);

// Middleware to parse URL-encoded bodies with extended option enabled
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Serving static files from the "public" directory
app.use(express.static("public"));

// Configuring cookie praser middleware
app.use(cookieParser());

// Router config
app.use("/api/v1/healthcheck", helathcheckRouter);
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/subscribe", subscibeRouter);
app.use("/api/v1/like", likeRouter);

// Middleware to handle error throw by ApiError
app.use(errorHandler);

export { app };

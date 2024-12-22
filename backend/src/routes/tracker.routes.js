import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { trackerImpression } from "../controllers/tracker.controllers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const trackerRouter = Router();

trackerRouter.get("/videotracker", verifyJwt, (req, res) => {
  res.sendFile(join(__dirname, "../utils/videoTracker.js"));
});
trackerRouter.get("/impression", verifyJwt, trackerImpression);

export { trackerRouter };

import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { analytics } from "../controllers/analytics.controllers.js";

const analyticsRouter = Router();

analyticsRouter.get("/report", verifyJwt, analytics);

export { analyticsRouter };

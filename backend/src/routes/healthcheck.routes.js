import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck.controllers.js";

const helathcheckRouter = Router();

helathcheckRouter.route("/").get(healthcheck);

export default helathcheckRouter


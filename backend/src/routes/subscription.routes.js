import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import {
  subscibeTo,
  unSubscibeTo,
} from "../controllers/subscription.controllers.js";

const subscibeRouter = Router();

subscibeRouter.route("/subscription").post(verifyJwt, subscibeTo);
subscibeRouter.route("/unsubscription").post(verifyJwt, unSubscibeTo);

export default subscibeRouter;

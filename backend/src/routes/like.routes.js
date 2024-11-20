import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { LikeTo, unLikeTo } from "../controllers/like.controllers.js";

const likeRouter = Router();

likeRouter.route("/like").post(verifyJwt, LikeTo);
likeRouter.route("/unlike").post(verifyJwt, unLikeTo);

export default likeRouter;

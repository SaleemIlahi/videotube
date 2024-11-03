import { Router } from "express";
import {
  uploadVideo,
  getVideoById,
  getAllvideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const videoRouter = Router();

videoRouter.route("/upload").post(
  verifyJwt,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
  ]),
  uploadVideo
);
videoRouter.route("/videos").get(verifyJwt, getVideoById);
videoRouter.route("/allvideos").get(verifyJwt, getAllvideo);

export default videoRouter;

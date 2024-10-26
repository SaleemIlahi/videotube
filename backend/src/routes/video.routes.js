import { Router } from "express";
import { uploadVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";

const videoRouter = Router();

videoRouter.route("/upload").post(
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
  ]),
  uploadVideo
);

export default videoRouter;

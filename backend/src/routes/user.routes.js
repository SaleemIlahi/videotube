import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyAuth,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

userRouter.route("/login").post(loginUser);

// secure routes
userRouter.route("/login").get(verifyJwt, verifyAuth);
userRouter.route("/logout").post(verifyJwt, logoutUser);

export default userRouter;

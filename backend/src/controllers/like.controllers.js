import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Like } from "../models/like.models.js";

const LikeTo = asyncHandler(async (req, res) => {
  const user = req.user;
  const { videoId } = req.body;

  const checkIfAlreayLike = await Like.find({
    video: videoId,
    likeBy: user?._id,
  });

  if (!checkIfAlreayLike) {
    throw new ApiError(500, "Already Subscrbed");
  }

  const like = await Like.create({
    video: videoId,
    likeBy: user?._id,
  });

  if (!like) {
    throw new ApiError(500, "Something went wrong while Liking Video");
  }

  res.status(200).json(new ApiResponse(200, "Liked video Successfully"));
});

const unLikeTo = asyncHandler(async (req, res) => {
  const { videoId } = req.body;

  const isLike = await Like.deleteOne({ video: videoId });

  if (!isLike) {
    throw new ApiError(500, "Something went wrong while UnLike");
  }

  res.status(200).json(new ApiResponse(200, "UnSubscribe Successfully"));
});

export { LikeTo, unLikeTo };

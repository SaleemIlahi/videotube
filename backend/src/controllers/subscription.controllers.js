import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Subscription } from "../models/subscription.models.js";

const subscibeTo = asyncHandler(async (req, res) => {
  const user = req.user;
  const { channelId } = req.body;

  const checkIfAlreaySubscribe = await Subscription.find({
    channel: channelId,
    subscriber: user?._id,
  });

  if (!checkIfAlreaySubscribe) {
    throw new ApiError(500, "Already Subscrbed");
  }

  const subscibe = await Subscription.create({
    channel: channelId,
    subscriber: user?._id,
  });

  if (!subscibe) {
    throw new ApiError(500, "Something went wrong while Subscrbing");
  }

  res.status(200).json(new ApiResponse(200, "Subscribe Successfully"));
});

const unSubscibeTo = asyncHandler(async (req, res) => {
  const { channelId } = req.body;

  const isSubscibe = await Subscription.deleteOne({ channel: channelId });

  if (!isSubscibe) {
    throw new ApiError(500, "Something went wrong while Subscrbing");
  }

  res.status(200).json(new ApiResponse(200, "UnSubscribe Successfully"));
});

export { subscibeTo, unSubscibeTo };

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Tracker } from "../models/tracker.models.js";

const trackerImpression = asyncHandler(async (req, res) => {
  const { videoId } = req.query;
  const { _id, geo, device } = req.user;
  const { city, state, country } = geo;
  const { browser, type, brand, os } = device;

  if (!videoId || !_id) {
    throw new ApiError(500, "Tracker failed");
  }

  const tracker = await Tracker.create({
    videoId: videoId,
    userId: _id,
    city,
    state,
    country,
    os,
    device: type,
    browser,
    brand,
  });
  return res.status(201).json(new ApiResponse(200, {}, "done"));
});

export { trackerImpression };

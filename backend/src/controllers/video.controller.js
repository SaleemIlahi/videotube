import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { exec } from "child_process";
import { ApiError } from "../utils/apiError.js";
import { runFFmpeg } from "../utils/videoSegment.js";

const uploadVideo = asyncHandler(async (req, res) => {
  console.log(req.files);
  let transcodedVideo = await runFFmpeg(
    req.files?.video?.[0]?.filename,
    "index.m3u8"
  );
  if (transcodedVideo) {
    res.status(200).json(new ApiResponse(200, transcodedVideo));
  }
});

export { uploadVideo };

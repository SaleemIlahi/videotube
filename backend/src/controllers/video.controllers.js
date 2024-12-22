import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { runFFmpeg } from "../utils/videoSegment.js";
import fs from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { uploadHLSOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import joi from "joi";
import escapeHtml from "escape-html";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readM3u8File = async (
  m3u8Path,
  transcodedVideo,
  uploadHlsToCloundinary
) => {
  const path = "/public/segment";
  const tempPath = "/public/temp";
  try {
    const data = await fs.readFile(m3u8Path, "utf8");
    const lines = data.split("\n");
    let videoDetials = [];
    let segments = lines
      .filter((line) => line.endsWith(".ts"))
      .map((line) => line.trim());
    segments = [...segments, "index.m3u8", "thumbnail.jpg"];

    for (const segment of segments) {
      try {
        const relativePath = join(
          __dirname,
          "..",
          "..",
          path,
          transcodedVideo.folder,
          segment
        );
        const folderPath = `videotube/upload/${transcodedVideo.folder}`;
        let video = await uploadHlsToCloundinary(relativePath, folderPath);
        videoDetials.push(video);
      } catch (error) {
        fs.rmdir(join(__dirname, "..", "..", path, transcodedVideo.folder));
        fs.unlink(
          join(__dirname, "..", "..", tempPath, `${transcodedVideo.folder}.mp4`)
        );
        new ApiError(500, error.message);
      }
    }
    fs.rmdir(join(__dirname, "..", "..", path, transcodedVideo.folder));
    fs.unlink(
      join(__dirname, "..", "..", tempPath, `${transcodedVideo.folder}.mp4`)
    );
    return {
      status: true,
      video: videoDetials.filter((v) => v.original_filename === "index")[0],
      thumbnail: videoDetials.filter(
        (v) => v.original_filename === "thumbnail"
      )[0],
    };
  } catch (error) {
    fs.rmdir(join(__dirname, "..", "..", path, transcodedVideo.folder));
    fs.unlink(
      join(__dirname, "..", "..", tempPath, `${transcodedVideo.folder}.mp4`)
    );
    new ApiError(500, error.message);
  }
};

const uploadVideo = asyncHandler(async (req, res) => {
  const user = req.user;

  // video credits check
  if (user?.videoLimit >= 2 && user.role !== "admin") {
    throw new ApiError(500, "Video uploading credit exceeded");
  }

  // updating limit
  const LimitUpdate = await User.findOneAndUpdate(
    { _id: user._id },
    { $inc: { videoLimit: 1 } },
    { new: true }
  );

  if (!LimitUpdate) {
    throw new ApiError(500, "Something went wrong");
  }

  // transcoding video with ffmpeg and docker
  let transcodedVideo = await runFFmpeg(
    req.files?.video?.[0]?.filename,
    "index.m3u8"
  );

  if (!transcodedVideo?.status) {
    throw new ApiError(500, "Something went wrong while transcoding video");
  }

  const m3u8Path = join(__dirname, "..", "..", transcodedVideo.filePath);

  // reading transcoded video and uploading in cloundinary
  let uploadedVideoDetails = await readM3u8File(
    m3u8Path,
    transcodedVideo,
    uploadHLSOnCloudinary
  );

  if (!uploadedVideoDetails?.status) {
    throw new ApiError(500, "Something went wrong while uploading video");
  }

  let metaData = JSON.parse(transcodedVideo?.metadata);

  const video = await Video.create({
    videoFile: uploadedVideoDetails.video.secure_url,
    thumbnail: uploadedVideoDetails.thumbnail.secure_url,
    title: req.files?.video?.[0]?.originalname,
    description: `${req.files?.video?.[0]?.originalname} - description`,
    originalFileName: req.files?.video?.[0]?.originalname,
    duration: metaData?.duration.seconds,
    dimension: metaData?.dimensions,
    owner: user._id,
  });

  const createdVideo = await Video.findById(video._id);

  if (!createdVideo) {
    throw new ApiError(
      500,
      "Something went wrong while creating video details"
    );
  }

  const response = {
    url: uploadedVideoDetails.video.secure_url,
    video: createdVideo,
  };
  res
    .status(200)
    .json(new ApiResponse(200, response, "Video uploaded successfully"));
});

const getVideoByUserId = asyncHandler(async (req, res) => {
  const user = req.user;
  const allVideo = await Video.aggregate([
    {
      $match: user._id ? { owner: new mongoose.Types.ObjectId(user._id) } : {},
    },
    {
      $lookup: {
        from: "subscriptions",
        let: {
          ownerId: "$owner",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$channel", "$$ownerId"] }],
              },
            },
          },
        ],
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "likes",
        let: {
          videoId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$video", "$$videoId"] }],
              },
            },
          },
        ],
        as: "likesCount",
      },
    },
    {
      $lookup: {
        from: "trackers",
        localField: "_id",
        foreignField: "videoId",
        as: "impressions",
      },
    },
    {
      $addFields: {
        views: { $size: "$impressions" },
        likes: { $size: "$likesCount" },
      },
    },
    {
      $project: {
        _id: 1,
        thumbnail: 1,
        title: 1,
        views: 1,
        createdAt: 1,
        updatedAt: 1,
        videoFile: 1,
        duration: 1,
        description: 1,
        owner: 1,
        likes: 1,
      },
    },
  ]);
  if (!allVideo) {
    new ApiError(404, "No video upload");
  }

  const response = {
    videos: allVideo,
  };

  res.status(200).json(new ApiResponse(200, response, "All videos"));
});

const getAllvideo = asyncHandler(async (req, res) => {
  const videoId = req.query.id;
  const allVideo = await Video.aggregate([
    {
      $match: videoId ? { _id: new mongoose.Types.ObjectId(videoId) } : {},
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        let: {
          ownerId: "$owner",
          currentUserId: req.user._id,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$subscriber", "$$currentUserId"] },
                  { $eq: ["$channel", "$$ownerId"] },
                ],
              },
            },
          },
        ],
        as: "subscribedTo",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        let: {
          ownerId: "$owner",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$channel", "$$ownerId"] }],
              },
            },
          },
        ],
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "likes",
        let: { videoId: "$_id", userId: req.user?._id },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$video", "$$videoId"] },
                  { $eq: ["$likeBy", "$$userId"] },
                ],
              },
            },
          },
        ],
        as: "LikeTo",
      },
    },
    {
      $lookup: {
        from: "likes",
        let: {
          videoId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$video", "$$videoId"] }],
              },
            },
          },
        ],
        as: "likesCount",
      },
    },
    {
      $lookup: {
        from: "trackers",
        localField: "_id",
        foreignField: "videoId",
        as: "impressions",
      },
    },
    {
      $addFields: {
        isSubscribed: { $gt: [{ $size: "$subscribedTo" }, 0] },
        isLike: { $gt: [{ $size: "$LikeTo" }, 0] },
        subscribeCount: { $size: "$subscribers" },
        views: { $size: "$impressions" },
        likeCount: { $size: "$likesCount" },
      },
    },
    {
      $project: {
        _id: 1,
        thumbnail: 1,
        title: 1,
        views: 1,
        createdAt: 1,
        videoFile: 1,
        duration: 1,
        description: 1,
        isSubscribed: 1,
        subscribeCount: 1,
        isLike: 1,
        owner: 1,
        likeCount: 1,
        channel: { $arrayElemAt: ["$user.username", 0] },
        name: { $arrayElemAt: ["$user.fullname", 0] },
        role: { $arrayElemAt: ["$user.role", 0] },
      },
    },
  ]);
  if (!allVideo) {
    new ApiError(404, "No video upload");
  }

  const response = {
    videos: allVideo,
  };

  res.status(200).json(new ApiResponse(200, response, "All videos"));
});

const videoJoiSchema = joi.object({
  title: joi.string().trim().messages({
    "any.required": "Title is a required field",
  }),
  description: joi.string().trim().messages({
    "any.required": "Description is a required field",
  }),
});

const updateVideoDetails = asyncHandler(async (req, res) => {
  // Validating video data
  const validateResult = videoJoiSchema.validate(req.body, {
    stripUnknown: true,
  });
  if (validateResult.error) {
    const message = validateResult.error.details[0].message;
    throw new ApiError(400, message);
  }
  const sanitizedData = {};
  for (const key in req.body) {
    sanitizedData[key] = escapeHtml(req.body[key]);
  }
  req.validatedData = sanitizedData;
  const { _id, title, description, playlist } = req.validatedData;
  const videoUpdate = await Video.findByIdAndUpdate(
    _id,
    {
      title,
      description,
    },
    { new: true }
  );

  if (!videoUpdate) {
    throw new ApiError(
      500,
      "Something went wrong while updating video details"
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, videoUpdate, "Video details updated successfully")
    );
});

export { uploadVideo, getVideoByUserId, getAllvideo, updateVideoDetails };

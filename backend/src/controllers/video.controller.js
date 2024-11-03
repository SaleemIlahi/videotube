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

  const video = Video.create({
    videoFile: uploadedVideoDetails.video.secure_url,
    thumbnail: "",
    title: req.files?.video?.[0]?.filename,
    description: `${req.files?.video?.[0]?.filename} - description`,
    originalFileName: req.files?.video?.[0]?.filename,
    owner: user._id,
  });

  if (!video) {
    throw new ApiError(
      500,
      "Something went wrong while creating video details"
    );
  }

  const response = {
    url: uploadedVideoDetails.video.secure_url,
    video: video,
  };
  res
    .status(200)
    .json(new ApiResponse(200, response, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const user = req.user;
  const allVideo = await Video.find({ owner: user._id }).sort({
    createdAt: -1,
  });
  if (!allVideo) {
    new ApiError(404, "No video upload");
  }

  const response = {
    videos: allVideo,
  };

  res.status(200).json(new ApiResponse(200, response, "All videos"));
});

const getAllvideo = asyncHandler(async (req, res) => {
  const allVideo = await Video.find().limit(50);
  if (!allVideo) {
    new ApiError(404, "No video upload");
  }

  const response = {
    videos: allVideo,
  };

  res.status(200).json(new ApiResponse(200, response, "All videos"));
});

export { uploadVideo, getVideoById, getAllvideo };

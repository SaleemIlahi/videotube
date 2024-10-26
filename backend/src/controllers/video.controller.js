import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { runFFmpeg } from "../utils/videoSegment.js";
import fs from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { uploadHLSOnCloudinary } from "../utils/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readM3u8File = async (
  m3u8Path,
  transcodedVideo,
  uploadHlsToCloundinary
) => {
  try {
    const data = await fs.readFile(m3u8Path, "utf8");
    const path = "/public/segment";
    const tempPath = "/public/temp";
    const lines = data.split("\n");
    let videoDetials = [];
    let segments = lines
      .filter((line) => line.endsWith(".ts"))
      .map((line) => line.trim());
    segments = [...segments, "index.m3u8"];

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
        new ApiError(500, error.message);
      }
    }
    fs.rmdir(join(__dirname, "..", "..", path, transcodedVideo.folder));
    console.log(
      join(__dirname, "..", "..", tempPath, `${transcodedVideo.folder}.mp4`)
    );
    fs.unlink(
      join(__dirname, "..", "..", tempPath, `${transcodedVideo.folder}.mp4`)
    );
    console.log(videoDetials);
  } catch (error) {
    new ApiError(500, error.message);
  }
};

const uploadVideo = asyncHandler(async (req, res) => {
  let transcodedVideo = await runFFmpeg(
    req.files?.video?.[0]?.filename,
    "index.m3u8"
  );
  if (transcodedVideo.status) {
    const m3u8Path = join(__dirname, "..", "..", transcodedVideo.filePath);
    readM3u8File(m3u8Path, transcodedVideo, uploadHLSOnCloudinary);

    res.status(200).json(new ApiResponse(200, transcodedVideo));
  }
});

export { uploadVideo };

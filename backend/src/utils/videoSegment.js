import { exec } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runFFmpeg = async (inputFileName, outputFileName) => {
  // Construct paths relative to the backend directory
  const backendDir = join(__dirname, "..", "..");
  const inputPath = join(backendDir, "public", "temp", inputFileName);
  const outputDirName = inputFileName.split(".")[0];

  // Check if input file exists
  if (!existsSync(inputPath)) {
    console.error(`Input file does not exist: ${inputPath}`);
    return;
  }

  const command = `docker run --rm \
    -v "${join(backendDir, "public", "temp")}:/temp" \
    -v "${join(backendDir, "public", "segment")}:/segment" \
    -e INPUT_VIDEO="/temp/${inputFileName}" \
    -e OUTPUT_DIR="${outputDirName}" \
    ffmpeg-video-segment`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ staus: false, message: `Error: ${error.message}` });
      } else if (stderr) {
        resolve({
          status: false,
          message: "Video Transcoded",
          folder: inputFileName.split(".")[0],
          filePath: `public/segment/${outputDirName}/index.m3u8`,
        });
      } else {
        resolve({
          status: false,
          message: "Video Transcoded",
          folder: inputFileName.split(".")[0],
          filePath: `public/segment/${outputDirName}/index.m3u8`,
        });
      }
    });
  });
};

export { runFFmpeg };

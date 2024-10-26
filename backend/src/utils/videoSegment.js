import { exec } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, mkdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runFFmpeg = async (inputFileName, outputFileName) => {
  // Construct paths relative to the backend directory
  const backendDir = join(__dirname, "..", "..");
  const inputPath = join(backendDir, "public", "temp", inputFileName);
  const outputDirName = inputFileName.split(".")[0];
  // const outputDir = join(backendDir, "public", "segment", outputDirName);

  // Check if input file exists
  if (!existsSync(inputPath)) {
    console.error(`Input file does not exist: ${inputPath}`);
    return;
  }

  // Create the output directory if it doesn't exist
  // if (!existsSync(outputDir)) {
  //   mkdirSync(outputDir, { recursive: true });
  // }

  const command = `docker run --rm \
    -v "${join(backendDir, "public", "temp")}:/temp" \
    -v "${join(backendDir, "public", "segment", outputDirName)}:/segment" \
    -e INPUT_VIDEO="/temp/${inputFileName}" \
    -e OUTPUT_DIR="${outputDirName}" \
    ffmpeg-video-segment`;

  console.log("Executing command:", command);

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
      } else if (stderr) {
        resolve({ output: `public/segment/${outputDirName}/index.m3u8` });
      } else {
        resolve({ output: `public/segment/${outputDirName}/index.m3u8` });
      }
    });
  });
};

export { runFFmpeg };

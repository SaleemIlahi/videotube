#!/bin/bash

mkdir -p "/segment/${OUTPUT_DIR}"

# Run ffmpeg
ffmpeg -i "${INPUT_VIDEO}" \
  -codec:v libx264 -codec:a aac \
  -hls_time 10 \
  -hls_playlist_type vod \
  -hls_segment_filename "/segment/${OUTPUT_DIR}/segment%03d.ts" \
  -start_number 0 \
  "/segment/${OUTPUT_DIR}/index.m3u8"

if [ $? -eq 0 ]; then
  # Generate thumbnail at 3 seconds
  ffmpeg -i "${INPUT_VIDEO}" \
    -ss 00:00:03 \
    -vframes 1 \
    -f image2 \
    "/segment/${OUTPUT_DIR}/thumbnail.jpg"
else
  echo "Error in video segmentation, thumbnail generation skipped."
  exit 1
fi

echo "FFmpeg processing completed."
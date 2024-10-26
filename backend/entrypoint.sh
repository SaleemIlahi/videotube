#!/bin/bash

# Run ffmpeg
ffmpeg -i "${INPUT_VIDEO}" \
  -codec:v libx264 -codec:a aac \
  -hls_time 10 \
  -hls_playlist_type vod \
  -hls_segment_filename "/segment/${OUTPUT_DIR}/segment%03d.ts" \
  -start_number 0 \
  "/segment/${OUTPUT_DIR}/index.m3u8"

echo "FFmpeg processing completed."
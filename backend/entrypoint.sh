#!/bin/bash

# Set up output directory
mkdir -p "/segment/${OUTPUT_DIR}"

# Get video dimensions and duration using ffprobe
dimensions=$(ffprobe -v error -hide_banner -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${INPUT_VIDEO}" 2>/dev/null)
duration=$(ffprobe -v error -hide_banner -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${INPUT_VIDEO}" 2>/dev/null)
width=$(echo $dimensions | cut -d'x' -f1)
height=$(echo $dimensions | cut -d'x' -f2)

# Function to format duration as HH:MM:SS
format_duration() {
    local total_seconds=$1
    local hours=$((total_seconds/3600))
    local minutes=$(((total_seconds%3600)/60))
    local seconds=$((total_seconds%60))
    printf "%02d:%02d:%02d" $hours $minutes $seconds
}

# Get integer duration and format it
duration_int=${duration%.*}
formatted_duration=$(format_duration $duration_int)

# Check if video is portrait (height > width) and exit if true
if [ "$height" -gt "$width" ]; then
    echo "{\"error\": \"Portrait videos are not allowed\", \"dimensions\": \"${width}x${height}\"}"
    exit 1
fi

# Function to parse stream sizes without jq
parse_stream_sizes() {
    local sizes="$1"
    local video_size=0
    local audio_size=0
    local subtitle_size=0
    local other_size=0
    local global_size=0

    if [[ $sizes =~ video:([0-9]+)kB ]]; then
        video_size="${BASH_REMATCH[1]}"
    fi
    if [[ $sizes =~ audio:([0-9]+)kB ]]; then
        audio_size="${BASH_REMATCH[1]}"
    fi
    if [[ $sizes =~ subtitle:([0-9]+)kB ]]; then
        subtitle_size="${BASH_REMATCH[1]}"
    fi
    if [[ $sizes =~ other\ streams:([0-9]+)kB ]]; then
        other_size="${BASH_REMATCH[1]}"
    fi
    if [[ $sizes =~ global\ headers:([0-9]+)kB ]]; then
        global_size="${BASH_REMATCH[1]}"
    fi

    echo "{\"video_kb\":$video_size,\"audio_kb\":$audio_size,\"subtitle_kb\":$subtitle_size,\"other_streams_kb\":$other_size,\"global_headers_kb\":$global_size}"
}

# Run ffmpeg for HLS segmentation, suppressing unwanted logs
ffmpeg -hide_banner -loglevel error -i "${INPUT_VIDEO}" \
    -codec:v libx264 -codec:a aac \
    -hls_time 10 \
    -hls_playlist_type vod \
    -hls_segment_filename "/segment/${OUTPUT_DIR}/segment%03d.ts" \
    -start_number 0 \
    "/segment/${OUTPUT_DIR}/index.m3u8" 2>/dev/null | tee ffmpeg.log

segmentation_status=$?

# Check if ffmpeg encountered an error during segmentation
if [ $segmentation_status -ne 0 ]; then
    # Capture stderr output from ffmpeg
    ffmpeg_error=$(grep -i "error" ffmpeg.log)
    echo "{\"error\": \"Video segmentation failed\", \"details\": \"$ffmpeg_error\"}"
    rm -f ffmpeg.log
    exit 1
fi

# If segmentation succeeds, generate thumbnail and output JSON
# Generate thumbnail at 3 seconds, suppressing unwanted logs
ffmpeg -hide_banner -loglevel error -i "${INPUT_VIDEO}" \
    -ss 00:00:03 \
    -vframes 1 \
    -f image2 \
    "/segment/${OUTPUT_DIR}/thumbnail.jpg" 2>/dev/null

# Get video metadata in JSON format, suppressing unwanted logs
metadata=$(ffprobe -v error -hide_banner \
    -show_entries format=duration,size,bit_rate \
    -show_entries stream=codec_name,codec_type,width,height,r_frame_rate,bit_rate \
    -of json \
    "${INPUT_VIDEO}" 2>/dev/null)

# Extract stream sizes from ffmpeg output log
stream_sizes=$(grep -o 'video:[0-9]\+kB audio:[0-9]\+kB subtitle:[0-9]\+kB other streams:[0-9]\+kB global headers:[0-9]\+kB' ffmpeg.log | tail -n 1)
stream_sizes_json=$(parse_stream_sizes "$stream_sizes")

# Create JSON response for successful processing
response=$(cat << EOF
{
    "status": "success",
    "dimensions": "${width}x${height}",
    "duration": {
        "seconds": ${duration_int},
        "formatted": "${formatted_duration}"
    },
    "stream_sizes": ${stream_sizes_json},
    "metadata": ${metadata}
}
EOF
)

# Clean up temporary log file
rm -f ffmpeg.log

# Output the JSON response
echo "$response"

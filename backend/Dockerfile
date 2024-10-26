# Use an official Ubuntu as the base image
FROM ubuntu:20.04

# Update package lists and install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Set the working directory in the container to /app
WORKDIR /app

# Use an entrypoint script to allow dynamic input
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Set the entrypoint to the script
ENTRYPOINT ["/app/entrypoint.sh"]
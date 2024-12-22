const video = parent.document.getElementById("trackedVideo");

const observer = (cb, options) => {
  return new IntersectionObserver(cb, options);
};

const videoObserver = observer((e) => {
  if (e[0].isIntersecting) {
    const videoId = parent.videoId;
    console.log("Video Observered");
    console.log(videoId);
    setTimeout(() => {
      sendTrackerData({
        event: "impression",
        timestamp: new Date().toISOString(),
        id: videoId,
      });
    }, 2000);
    videoObserver.disconnect();
  }
});

videoObserver.observe(video);

video.addEventListener("play", () => {
  console.log("Video started");
  sendTrackerData({ event: "play", timestamp: new Date().toISOString() });
});

// Log when the video is paused
video.addEventListener("pause", () => {
  console.log("Video paused");
  sendTrackerData({ event: "pause", timestamp: new Date().toISOString() });
});

// Log when the video is completed
video.addEventListener("ended", () => {
  console.log("Video ended");
  sendTrackerData({ event: "ended", timestamp: new Date().toISOString() });
});

// Log when the user seeks
video.addEventListener("seeked", () => {
  console.log(`Video seeked to ${video.currentTime}`);
  sendTrackerData({ event: "seek", currentTime: video.currentTime });
});

// Send tracker data to a server
function sendTrackerData(data) {
  console.log(data);
  const { id, event } = data;
  console.log(id);
  if (event === "impression") {
    fetch(`http://localhost:8000/api/v1/tracker/impression?videoId=${id}`, {
      credentials: "include",
    })
      .then((response) => console.log("Tracker data sent:", response))
      .catch((error) => console.error("Error sending tracker data:", error));
  }
}

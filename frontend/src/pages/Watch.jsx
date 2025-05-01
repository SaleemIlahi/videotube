import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  subscription,
  unsubscription,
  allVideos,
  like,
  unlike,
} from "../utils/api";
import { useAsyncHandler } from "../utils/asyncHandler";
import S from "../styles/watch.module.scss";
import HlsPlayer from "../components/HlsPlayer";
import { timeAgo } from "../utils/time";
import Icons from "../components/Icons";
import { useDispatch, useSelector } from "react-redux";
import { ERROR } from "../features/errorSlice";
import { CURRENT_VIDEO, SUBSCRIBE, LIKE } from "../features/videoSlice";

function Watch() {
  const [searchParams] = useSearchParams();
  const videoData = useSelector((state) => state.videoReducer.videos);
  const user = useSelector((state) => state.authReducer.auth.user);
  const currentVideo = useSelector((state) => state.videoReducer.currentVideo);
  const dispatch = useDispatch();
  const [video, setVideo] = useState(null);

  const [videoId] = useAsyncHandler(async (id) => {
    const res = await allVideos(id);
    if (res.statusCode === 200) {
      setVideo(res.data.videos[0]);
      window.videoId = res.data.videos[0]._id;
      dispatch(CURRENT_VIDEO(res.data.videos[0]));
    } else {
      dispatch(
        ERROR({
          message: res.message,
          type: "danger",
          timeline: true,
          status: true,
        })
      );
    }
  });

  useEffect(() => {
    window.videoId = currentVideo._id;
    setVideo(currentVideo);
  }, [currentVideo]);

  useEffect(() => {
    const v = searchParams.get("v");
    const watchVideo = () => {
      const videoDetails = videoData.filter((o) => o._id === v);
      if (videoDetails.length > 0) {
        setVideo(videoDetails[0]);
      } else {
        videoId(v);
      }
    };
    watchVideo();
  }, []);

  const [subscribe] = useAsyncHandler(async (id) => {
    const res = await subscription(JSON.stringify({ channelId: id }));
    if (res.statusCode === 200) {
      dispatch(SUBSCRIBE(currentVideo.subscribeCount + 1));
    } else {
      dispatch(
        ERROR({
          message: res.message,
          type: "danger",
          timeline: true,
          status: true,
        })
      );
    }
  });

  const [unsubscribe] = useAsyncHandler(async (id) => {
    const res = await unsubscription(JSON.stringify({ channelId: id }));
    if (res.statusCode === 200) {
      dispatch(SUBSCRIBE(currentVideo.subscribeCount - 1));
    } else {
      dispatch(
        ERROR({
          message: res.message,
          type: "danger",
          timeline: true,
          status: true,
        })
      );
    }
  });

  const [unlikeTo] = useAsyncHandler(async (id) => {
    const res = await unlike(JSON.stringify({ videoId: id }));
    if (res.statusCode === 200) {
      dispatch(LIKE(currentVideo.likeCount - 1));
    } else {
      dispatch(
        ERROR({
          message: res.message,
          type: "danger",
          timeline: true,
          status: true,
        })
      );
    }
  });

  const [likeTo] = useAsyncHandler(async (id) => {
    const res = await like(JSON.stringify({ videoId: id }));
    if (res.statusCode === 200) {
      dispatch(LIKE(currentVideo.likeCount + 1));
    } else {
      dispatch(
        ERROR({
          message: res.message,
          type: "danger",
          timeline: true,
          status: true,
        })
      );
    }
  });

  return (
    <div className={S.watch_cnt}>
      <div className={S.left}>
        {video && (
          <>
            <div className={S.video_player}>
              <HlsPlayer
                controls={true}
                autoplay={false}
                type="application/x-mpegURL"
                thumbnail={video.thumbnail}
                src={video.videoFile}
              />
            </div>
            <div className={S.video_details}>
              <h2 className={S.title}>{video.title}</h2>
              <div className={S.channel}>
                <div className={S.avatar}></div>
                <div className={S.channel_name}>
                  <span>
                    {video.role === "admin" && <Icons name="verified" />}
                    {video.name}
                  </span>
                  <div className={S.subscribe}>
                    {video.subscribeCount} Subcribers
                  </div>
                </div>
                {user._id !== currentVideo.owner && (
                  <button
                    className={
                      video.isSubscribed
                        ? S.subscribe_btn + " " + S.subscribed
                        : S.subscribe_btn
                    }
                    onClick={() =>
                      video.isSubscribed
                        ? unsubscribe(video.owner)
                        : subscribe(video.owner)
                    }
                  >
                    Subscribe
                  </button>
                )}

                <div
                  className={S.like}
                  onClick={() =>
                    video?.isLike ? unlikeTo(video._id) : likeTo(video._id)
                  }
                >
                  {video.isLike ? (
                    <Icons name="like_solid" />
                  ) : (
                    <Icons name="like_outline" />
                  )}
                  <div className={S.like_count}>{video.likeCount}</div>
                </div>
              </div>
              <div className={S.descriptiion}>
                <div className={S.d_1}>
                  <div className={S.views}>{video.views} views</div>
                  <div className={S.views}>{timeAgo(video.createdAt)}</div>
                </div>
                <div className={S.d_2}>{video.description}</div>
              </div>
            </div>
            <iframe
              style={{ display: "none" }}
              srcDoc='<!DOCTYPE html>
    <html lang="en">
    <head>
      <script>
        (async () => {
          const response = await fetch("http://localhost:8000/api/v1/tracker/videotracker",{credentials: "include"});
          const scriptText = await response.text();
          const scriptTag = document.createElement("script");
          scriptTag.append(document.createTextNode(scriptText));
          const intervalCheck = setInterval(() => {
            if(parent.document.getElementById("trackedVideo")){
              document.body.append(scriptTag);
              clearInterval(intervalCheck);
            }
          },1000)
        })();
      </script>
    </head>
    <body>
    </body>
    </html>'
            ></iframe>
          </>
        )}
      </div>
      <div className={S.right}></div>
    </div>
  );
}

export default Watch;

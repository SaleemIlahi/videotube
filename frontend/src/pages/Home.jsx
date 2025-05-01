import React, { useEffect, useState, useRef } from "react";
import { allVideos } from "../utils/api";
import { useAsyncHandler } from "../utils/asyncHandler";
import { useDispatch, useSelector } from "react-redux";
import { ERROR } from "../features/errorSlice";
import { VIDEO, CURRENT_VIDEO } from "../features/videoSlice";
import S from "../styles/home.module.scss";
import { observer } from "../utils/observer";
import { timeAgo } from "../utils/time";
import Icons from "../components/Icons";
import { Link, useNavigate } from "react-router-dom";

const VideoCard = (props) => {
  const {
    thumbnail,
    avatar,
    title,
    name,
    channel,
    views,
    createdAt,
    role,
    id,
  } = props;
  const timeDate = timeAgo(createdAt);
  const videos = useSelector((state) => state.videoReducer.videos);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const watchVideo = (id) => {
    const clickedVideo = videos.filter((o) => o._id === id)[0];
    dispatch(CURRENT_VIDEO(clickedVideo));
    navigate(`/watch?v=${id}`);
  };
  return (
    <div onClick={() => watchVideo(id)} className={S.card_cnt}>
      <div className={S.card_thumbnail}>
        <img data-src={thumbnail} src="" alt={title} />
      </div>
      <div className={S.card_details}>
        <div className={S.avatar}></div>
        <div className={S.info}>
          <div className={S.title}>{title}</div>
          <div className={S.channel}>
            {role === "admin" && <Icons name="verified" />}
            <Icons name="channel" /> {name}
          </div>
          <div className={S.meta}>
            <div className={S.views}>{views} views</div>
            <div className={S.createdAt}>{timeDate} ago</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const dispatch = useDispatch();
  const [videos, setVideos] = useState([]);
  const videoRef = useRef(null);
  const [allvideo] = useAsyncHandler(async () => {
    const res = await allVideos();
    if (res.statusCode === 200) {
      dispatch(VIDEO(res.data.videos));
      setVideos(res.data.videos);
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

  const videoGrid = () => {
    const imageObserver = observer(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const imgTag = e.target.querySelector("img");
            const url = imgTag.getAttribute("data-src");
            imgTag.src = url;
            imageObserver.unobserve(e.target);
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );

    if (videoRef.current) {
      const videos = Array.from(videoRef.current.children);
      videos.forEach((video) => {
        imageObserver.observe(video);
      });
    }
  };

  useEffect(() => {
    videoGrid();
  }, [videos]);

  useEffect(() => {
    allvideo();
  }, []);
  return (
    <div className={S.home_cnt}>
      <div className={S.grid} ref={videoRef}>
        {videos.map((o) => (
          <VideoCard
            key={o._id}
            thumbnail={o.thumbnail}
            avatar=""
            title={o.title}
            views={o.views}
            createdAt={o.createdAt}
            channel={o.channel}
            name={o.name}
            role={o.role}
            id={o._id}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;

import React, { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import S from "../styles/hls.module.scss";
import Icons from "./Icons";

function HlsPlayer(props) {
  const { src, type, controls, autoplay, thumbnail } = props;
  const videoRef = useRef(null);
  const [play, setPlay] = useState(autoplay);
  useEffect(() => {
    if (videoRef.current && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (play) {
          videoRef.current.play();
        }
      });

      return () => {
        if (hls) {
          hls.destroy();
        }
      };
    }
  }, [src, play]);
  return (
    <div className={S.hls_player}>
      {play ? (
        <video ref={videoRef} controls={controls} autoPlay={play}>
          <source type={type} src={src} />
        </video>
      ) : (
        <div className={S.thumbnail} onClick={() => setPlay(true)}>
          <img src={thumbnail} alt={thumbnail} />
          <div className={S.play_overlay}>
            <Icons name="play" />
          </div>
        </div>
      )}
    </div>
  );
}

export default HlsPlayer;

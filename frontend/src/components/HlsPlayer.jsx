import React, { useRef, useEffect } from "react";
import Hls from "hls.js";
import S from "../styles/hls.module.scss";

function HlsPlayer(props) {
  const { src, type, controls, autoplay } = props;
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play();
      });

      return () => {
        if (hls) {
          hls.destroy();
        }
      };
    }
  }, [src]);
  return (
    <div className={S.hls_player}>
      <video ref={videoRef} controls={controls} autoplay={autoplay}>
        <source type={type} src={src} />
      </video>
    </div>
  );
}

export default HlsPlayer;

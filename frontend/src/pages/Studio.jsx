import React, { useState } from "react";
import S from "../styles/studio.module.scss";
import Modal from "../components/Modal";
import Element from "../components/Element";
import HlsPlayer from "../components/HlsPlayer";

const UploadVideo = () => {
  const [videoDetails, setVideoDetails] = useState({
    video: null,
    link: null,
    title: null,
    description: null,
  });

  const videoSchema = [
    {
      title: "Details",
      id: "details",
      items: [
        {
          data: {
            type: "textarea",
            name: "title",
            placeholder: "Add a title that describes your video",
            characterLimit: 100,
          },
          set: (n, v) => {
            setVideoDetails((s) => ({ ...s, [n]: v }));
          },
          get: (n) => (videoDetails[n] === "" ? null : videoDetails[n]),
        },
        {
          data: {
            type: "textarea",
            name: "description",
            placeholder: "Tell viewers about your video",
            characterLimit: 1000,
          },
          set: (n, v) => setVideoDetails((s) => ({ ...s, [n]: v })),
          get: (n) => (videoDetails[n] === "" ? null : videoDetails[n]),
        },
      ],
    },
    {
      title: "Thumbnail",
      id: "thumbnail",
      items: [
        {
          data: {
            type: "file",
            name: "thumbnail",
            accept: "image/*",
            placeholder: "Upload thumbnail image",
            flex: true,
            icon: "image_upload",
          },
          set: (n, v) => {
            setVideoDetails((s) => ({ ...s, [n]: v }));
          },
          get: (n) => videoDetails[n],
        },
      ],
    },
    {
      title: "Playlist",
      id: "playlist",
      items: [
        {
          data: {
            type: "multiselect",
            name: "playlist",
            placeholder:
              "Add video in playlist for organise content for viewers",
            options: [
              { id: "list1", name: "List 1" },
              { id: "list2", name: "List 2" },
              { id: "list3", name: "List 3" },
              { id: "list4", name: "List 4" },
            ],
          },
          set: (n, v) => {
            setVideoDetails((s) => ({ ...s, [n]: v }));
          },
          get: (n) => videoDetails[n],
        },
      ],
    },
  ];

  return (
    <div className={S.upload_video_cnt}>
      {videoDetails.video ? (
        <div className={S.video_detail}>
          <div className={S.video_detail_fields}>
            {videoSchema.map((o) => (
              <div key={o.id} className={S.video_detail_fields_box}>
                <div className={S.video_detail_fields_box_title}>{o.title}</div>
                {o.items.map((i) => (
                  <div
                    className={
                      o.id === "playlist"
                        ? S.video_detail_fields_box_input + " " + S.custom
                        : S.video_detail_fields_box_input
                    }
                  >
                    <Element
                      key={i.data.name}
                      data={i.data}
                      set={i.set}
                      get={i.get}
                    />
                  </div>
                ))}
              </div>
            ))}
            <div className={S.video_detail_button}>
              <Element
                data={{
                  type: "button",
                  name: "video_details_submit",
                  text: "Save",
                }}
                set={() => console.log("first")}
              />
            </div>
          </div>
          <div className={S.video_detail_right}>
            <div className={S.video_preview}>
              <HlsPlayer
                controls={true}
                autoplay={false}
                type="application/x-mpegURL"
                src="http://localhost:8000/segment/video-1729444808913-856462768/video-1729444808913-856462768/index.m3u8"
              />
              <div className={S.video_name}>
                Filenmae
                <div className={S.video_filename}>
                  {videoDetails?.video?.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={S.upload_video_cnt_box}>
          <Element
            data={{
              type: "file",
              name: "video",
              accept: "video/mp4",
              placeholder: "Click inside dashed line and upload your video",
              icon: "upload",
            }}
            set={(n, v, f) => {
              setVideoDetails((s) => ({ ...s, [n]: v, link: f }));
            }}
            get={(n) => videoDetails[n]}
          />
        </div>
      )}
    </div>
  );
};

const Studio = () => {
  const ModalInitialState = {
    id: "",
    status: false,
  };
  const [modalOpen, setModalOpen] = useState(ModalInitialState);
  const uploadModal = {
    upload: {
      title: "Upload Video",
      close: () => setModalOpen(ModalInitialState),
      Component: () => <UploadVideo />,
    },
  };
  return (
    <div className={S.studio_cnt}>
      <div className={S.studio_cnt_header}>
        <div className={S.studio_cnt_header_title}>Channel Content</div>
        <div
          className={S.studio_cnt_header_create}
          onClick={() => setModalOpen({ id: "upload", status: true })}
        >
          Create
        </div>
      </div>
      <div className={S.studio_cnt_body}></div>
      {modalOpen.status && <Modal {...uploadModal[modalOpen.id]} />}
    </div>
  );
};

export default Studio;

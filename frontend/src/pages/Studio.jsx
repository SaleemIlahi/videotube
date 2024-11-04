import React, {
  useState,
  useEffect,
  memo,
  useMemo,
  useCallback,
  useRef,
} from "react";
import S from "../styles/studio.module.scss";
import Modal from "../components/Modal";
import Element from "../components/Element";
import HlsPlayer from "../components/HlsPlayer";
import { uploadVideo, updateVideo, videosByUser } from "../utils/api";
import { useAsyncHandler } from "../utils/asyncHandler";
import { useDispatch } from "react-redux";
import { ERROR } from "../features/errorSlice";
import Table from "../components/Table";
import { Loading } from "../App";
import { observer } from "../utils/observer";

const UploadVideo = memo(({ initialValue, close }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [videoDetails, setVideoDetails] = useState(
    initialValue ?? {
      video: null,
      link: null,
      title: null,
      thumbnail: null,
      playlist: [],
      description: null,
    }
  );

  const handleSetVideoDetails = useCallback((name, value) => {
    setVideoDetails((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFileUpload = useCallback((name, value, file) => {
    setVideoDetails((prev) => ({ ...prev, [name]: value, link: file }));
  }, []);

  const getVideoDetail = useCallback(
    (name) => {
      if (name === "playlist") {
        return !videoDetails?.[name] ? [] : videoDetails[name];
      } else {
        return !videoDetails?.[name] ? null : videoDetails[name];
      }
    },
    [videoDetails]
  );

  const videoSchema = useMemo(
    () => [
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
            set: (n, v) => handleSetVideoDetails(n, v),
            get: (v) => getVideoDetail(v),
          },
          {
            data: {
              type: "textarea",
              name: "description",
              placeholder: "Tell viewers about your video",
              characterLimit: 1000,
            },
            set: (n, v) => handleSetVideoDetails(n, v),
            get: (v) => getVideoDetail(v),
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
              placeholder: "Auto generated",
              flex: true,
              icon: "ai",
              style: { width: "250px" },
              disabled: true,
            },
            set: (n, v) => handleSetVideoDetails(n, v),
            get: (v) => getVideoDetail(v),
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
            set: (n, v) => handleSetVideoDetails(n, v),
            get: (v) => getVideoDetail(v),
          },
        ],
      },
    ],
    [handleSetVideoDetails, getVideoDetail]
  );

  const [videoUploadApi] = useAsyncHandler(async (n, v, f) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("video", v);
    const res = await uploadVideo(formData);
    if (res.statusCode === 200) {
      const {
        videoFile,
        thumbnail,
        title,
        description,
        originalFileName,
        _id,
      } = res.data.video;
      setVideoDetails({
        video: originalFileName,
        link: videoFile,
        title: title,
        thumbnail: thumbnail,
        playlist: [],
        description: description,
        _id,
      });
      dispatch(
        ERROR({
          message: res.message,
          type: "success",
          timeline: true,
          status: true,
        })
      );
      setLoading(false);
    } else {
      dispatch(
        ERROR({
          message: res.message,
          type: "danger",
          timeline: true,
          status: true,
        })
      );
      setLoading(false);
    }
  });

  const [updateVideoApi] = useAsyncHandler(async () => {
    const videoData = {
      title: videoDetails.title,
      description: videoDetails.description,
      _id: videoDetails._id,
    };
    const res = await updateVideo(JSON.stringify(videoData));
    if (res.statusCode === 200) {
      dispatch(
        ERROR({
          message: res.message,
          type: "success",
          timeline: true,
          status: true,
        })
      );
      close();
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

  const renderVideoDetials = useMemo(
    () => (
      <div className={S.video_detail}>
        <div className={S.video_detail_fields}>
          {videoSchema.map((o, i) => (
            <div key={o.id + i + o.title} className={S.video_detail_fields_box}>
              <div className={S.video_detail_fields_box_title}>{o.title}</div>
              {o.items.map((i) => (
                <div
                  key={i.data.name}
                  className={
                    o.id === "playlist"
                      ? S.video_detail_fields_box_input + " " + S.custom
                      : S.video_detail_fields_box_input
                  }
                >
                  <Element data={i.data} set={i.set} get={i.get} />
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
              set={() => {
                updateVideoApi();
              }}
            />
          </div>
        </div>
        <div className={S.video_detail_right}>
          <div className={S.video_preview}>
            <HlsPlayer
              controls={true}
              autoplay={false}
              type="application/x-mpegURL"
              thumbnail={videoDetails.thumbnail}
              src={videoDetails.link}
            />
            <div className={S.video_name}>
              Filenmae
              <div className={S.video_filename}>
                {videoDetails?.video?.name || videoDetails?.video}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    [videoSchema, videoDetails.video]
  );

  const renderUploadBox = useMemo(
    () => (
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
            videoUploadApi(n, v, f);
          }}
          get={(n) => videoDetails[n]}
        />
      </div>
    ),
    [handleFileUpload, getVideoDetail]
  );

  return loading ? (
    <Loading />
  ) : (
    <div className={S.upload_video_cnt}>
      {videoDetails.video ? renderVideoDetials : renderUploadBox}
    </div>
  );
});

const VideoList = (props) => {
  const { editModal } = props;
  const dispatch = useDispatch();
  const [tableBody, setTableBody] = useState([]);
  const tableRef = useRef(null);

  const dateFormat = (date) => {
    const dt = new Date(date);
    const month = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const d = dt.getDate().toString().padStart(2, "0");
    const m = month[dt.getMonth()];
    const y = dt.getFullYear();
    const h = dt.getHours().toString().padStart(2, "0");
    const mns = dt.getMinutes().toString().padStart(2, "0");
    const sec = dt.getSeconds().toString().padStart(2, "0");
    const f = Number(h) >= 12 ? "PM" : "AM";

    return { date: `${d} ${m} ${y}`, time: `${h}:${mns}:${sec} ${f}` };
  };

  const [d] = useAsyncHandler(
    async () => {
      const res = await videosByUser();
      return res;
    },
    {
      onSuccess: (res) => {
        if (res.statusCode === 200) {
          let videos = res.data.videos;
          let tableRow = [];
          videos.forEach((v) => {
            tableRow.push([
              {
                id: "date",
                value: (
                  <div className={S.date_box}>
                    <div className={S.date}>{dateFormat(v.createdAt).date}</div>
                    <div className={S.when}>
                      <div className={S.col}>
                        <span>Created at</span>
                        <span>{dateFormat(v.createdAt).time}</span>
                      </div>
                      <div className={S.col}>
                        <span>Update at</span>
                        <span>{dateFormat(v.updatedAt).time}</span>
                      </div>
                    </div>
                  </div>
                ),
                style: { textAlign: "start" },
              },
              {
                id: "video",
                value: (
                  <div className={S.video_box}>
                    <div className={S.thumbnail}>
                      <img
                        data-src={v.thumbnail}
                        src=""
                        alt={v.title}
                        loading="lazy"
                      />
                    </div>
                    <div className={S.details}>
                      <div className={S.title}>{v.title}</div>
                      <div className={S.description}>
                        {v.description !== "" ? v.description : "Description"}
                      </div>
                    </div>
                  </div>
                ),
                style: { textAlign: "start" },
              },
              {
                id: "views",
                value: v.views,
                style: { textAlign: "end" },
              },
              {
                id: "comments",
                value: v.likes ?? 0,
                style: { textAlign: "end" },
              },
              {
                id: "comments",
                value: v.comments ?? 0,
                style: { textAlign: "end" },
              },
              {
                id: "action",
                value: (
                  <div
                    className={S.edit}
                    onClick={() =>
                      editModal({
                        video: v.originalFileName,
                        link: v.videoFile,
                        title: v.title,
                        description: v.description,
                        thumbnail: v.thumbnail,
                        _id: v._id,
                      })
                    }
                  >
                    Edit
                  </div>
                ),
                style: { textAlign: "center" },
              },
            ]);
          });
          setTableBody(tableRow);
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
      },
    }
  );

  useEffect(() => {
    d();
  }, []);

  const tableHead = [
    {
      id: "date",
      name: "Date",
      style: {
        width: "20%",
        textAlign: "start",
      },
    },
    {
      id: "video",
      name: "Video",
      style: {
        width: "40%",
        textAlign: "start",
      },
    },
    {
      id: "views",
      name: "Views",
      style: {
        width: "10%",
        textAlign: "end",
      },
    },
    {
      id: "likes",
      name: "Likes",
      style: {
        width: "10%",
        textAlign: "end",
      },
    },
    {
      id: "comments",
      name: "Comments",
      style: {
        width: "10%",
        textAlign: "end",
      },
    },
    {
      id: "action",
      name: "Action",
      style: {
        width: "10%",
        textAlign: "center",
      },
    },
  ];

  useEffect(() => {
    const imageObserver = observer(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const imageColumn = e.target.children[1];
            const imageTag = imageColumn.querySelector("[data-src]");
            const imageUrl = imageTag.getAttribute("data-src");
            imageTag.src = imageUrl;
            imageObserver.unobserve(e.target);
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );

    if (tableRef.current) {
      const rows = tableRef.current.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        imageObserver.observe(row);
      });
    }
  }, [tableBody]);

  return (
    <div className={S.videolist_cnt}>
      {tableBody.length > 0 ? (
        <Table
          tableRef={tableRef}
          tableHead={tableHead}
          tableBody={tableBody}
        />
      ) : (
        <div className={S.video_empty}>
          <img
            loading="lazy"
            src="https://res.cloudinary.com/do63p55lo/image/upload/v1730211540/videotube/asset/video_fl0bpm.svg"
            alt="video"
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
    data: null,
  };
  const [modalOpen, setModalOpen] = useState(ModalInitialState);
  const uploadModal = {
    upload: {
      title: "Upload Video",
      close: () => setModalOpen(ModalInitialState),
      Component: () => (
        <UploadVideo
          close={() => setModalOpen(ModalInitialState)}
          initialValue={modalOpen.data}
        />
      ),
    },
  };

  return (
    <div className={S.studio_cnt}>
      <div className={S.studio_cnt_header}>
        <div className={S.studio_cnt_header_title}>Channel Content</div>
        <div
          className={S.studio_cnt_header_create}
          onClick={() =>
            setModalOpen({ id: "upload", status: true, data: null })
          }
        >
          Create
        </div>
      </div>
      <div className={S.studio_cnt_body}>
        <VideoList
          editModal={(data) => {
            setModalOpen({ id: "upload", status: true, data: data });
          }}
        />
      </div>
      {modalOpen.status && <Modal {...uploadModal[modalOpen.id]} />}
    </div>
  );
};

export default Studio;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  videos: [],
  currentVideo: {},
};

export const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    VIDEO: (state, action) => {
      state.videos = action.payload;
    },
    CURRENT_VIDEO: (state, action) => {
      state.currentVideo = action.payload;
    },
    SUBSCRIBE: (state, action) => {
      state.currentVideo.isSubscribed = !state.currentVideo.isSubscribed;
      state.currentVideo.subscribeCount = action.payload;
    },
    LIKE: (state, action) => {
      state.currentVideo.isLike = !state.currentVideo.isLike;
      state.currentVideo.likeCount = action.payload;
    },
  },
});

export const {
  VIDEO,
  CURRENT_VIDEO,
  SUBSCRIBE,
  SUBSCRIBE_COUNT,
  LIKE,
  LIKE_COUNT,
} = videoSlice.actions;
export default videoSlice.reducer;

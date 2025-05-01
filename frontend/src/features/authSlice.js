import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  auth: null,
  isLoading: false,
  browserHistory: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    LOGIN: (state, action) => {
      state.auth = action.payload;
    },
    LOGOUT: (state, action) => {
      state.auth = null;
    },
    HISTTORY: (state, action) => {
      state.browserHistory = action.payload;
    },
  },
});

export const { LOGIN, LOGOUT, HISTTORY } = authSlice.actions;
export default authSlice.reducer;

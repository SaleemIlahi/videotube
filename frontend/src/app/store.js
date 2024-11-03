import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice.js";
import errorReducer from "../features/errorSlice.js";

export const store = configureStore({
  reducer: {
    authReducer,
    errorReducer,
  },
});

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  error: null,
};

export const errorSlice = createSlice({
  name: "error",
  initialState,
  reducers: {
    ERROR: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { ERROR } = errorSlice.actions;
export default errorSlice.reducer;

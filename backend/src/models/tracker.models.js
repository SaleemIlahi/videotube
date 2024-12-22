import mongoose, { Schema } from "mongoose";

const trackerSchema = new Schema(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    os: {
      type: String,
    },
    device: {
      type: String,
    },
    browser: {
      type: String,
    },
    brand: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Tracker = mongoose.model("Tracker", trackerSchema);

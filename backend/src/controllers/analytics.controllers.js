import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Tracker } from "../models/tracker.models.js";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import mongoose from "mongoose";

const groupBy = async (id, cohort) => {
  const data = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(id) },
    },
    {
      $lookup: {
        from: "trackers",
        let: { videoId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$videoId", "$$videoId"] },
            },
          },
        ],
        as: "impression",
      },
    },
    {
      $unwind: "$impression",
    },
    {
      $group: {
        _id: "$impression." + cohort,
        _impressions: { $sum: 1 },
      },
    },
    {
      $sort: {
        _impressions: -1,
      },
    },
    {
      $project: {
        title: "$_id",
        _impressions: 1,
        _type: cohort,
        _id: 0,
      },
    },
  ]);

  return data;
};

const impression = async (id) => {
  const data = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(id) },
    },
    {
      $lookup: {
        from: "trackers",
        localField: "_id",
        foreignField: "videoId",
        as: "impressions",
      },
    },
    {
      $addFields: {
        _impressions: { $size: "$impressions" },
        _type: "video",
      },
    },
    {
      $sort: {
        _impressions: -1,
      },
    },
    {
      $project: {
        title: 1,
        _impressions: 1,
        _repeatedImpressions: 1,
        _type: 1,
        _id: 1,
      },
    },
  ]);

  return data;
};

const totalCount = async (id) => {
  const data = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(id) },
    },
    {
      $lookup: {
        from: "trackers",
        localField: "_id",
        foreignField: "videoId",
        as: "impressions",
      },
    },
    {
      $addFields: {
        totalImpression: { $size: "$impressions" },
      },
    },
    {
      $group: {
        _id: null,
        totalImpression: { $sum: "$totalImpression" },
      },
    },
    {
      $project: {
        totalImpression: 1,
        _id: 0,
      },
    },
  ]);

  return data[0];
};

const analytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { cohort } = req.query;
  const avaliableCohorts = [
    {
      id: undefined,
      name: "Video",
      icon: "videoicon",
    },
    {
      id: "city",
      name: "City",
      icon: "location",
    },
    {
      id: "state",
      name: "State",
      icon: "location",
    },
    {
      id: "country",
      name: "Country",
      icon: "location",
    },
    {
      id: "device",
      name: "Device",
      icon: "device",
    },
    {
      id: "browser",
      name: "Browser",
      icon: "browser",
    },
    {
      id: "os",
      name: "Operating System",
      icon: "os",
    },
  ];

  const tableHead = [
    {
      id: "title",
      name: "Title",
    },
    {
      id: "impression",
      name: "Impression",
    },
  ];

  let reports = [];
  let data = {};

  if (cohort && cohort !== "") {
    if (!avaliableCohorts.some((o) => o.id === cohort)) {
      throw new ApiError(404, "Cohort not found");
    }
    reports = await groupBy(userId, cohort);
  } else {
    reports = await impression(userId);
  }

  const totalImpression = await totalCount(userId);

  data.reports = reports;
  data.cohorts = avaliableCohorts;
  data.totalImpression = totalImpression;
  data.tableHead = tableHead;
  res.status(200).json(new ApiResponse(200, data, "Impression"));
});

export { analytics };

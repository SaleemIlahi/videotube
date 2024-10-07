import { asyncHandler } from "../utils/asyncHandler.js";
import joi from "joi";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloundinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Generating Access and Refresh Token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

// validation schema for user data
const registerJoiSchema = joi.object({
  fullname: joi.string().trim().alphanum().min(4).max(30).required().messages({
    "string.base": "Full Name should be a type of string",
    "string.empty": "Full Name cannot be an empty field",
    "string.min": "Full Name should have a minimum length of {#limit}",
    "string.max": "Full Name should have a maximum length of {#limit}",
    "string.alphanum": "Full Name cannot have specail characters",
    "any.required": "Full Name is a required field",
  }),
  email: joi
    .string()
    .email({ tlds: { allow: ["com"] } })
    .message({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is a required field",
    }),
  username: joi
    .string()
    .trim()
    .alphanum()
    .min(4)
    .max(10)
    .required()
    .case("lower")
    .messages({
      "string.base": "Username should be a type of string",
      "string.empty": "Username cannot be an empty field",
      "string.min": "Username should have a minimum length of {#limit}",
      "string.max": "Username should have a maximum length of {#limit}",
      "string.alphanum": "Username cannot have specail characters",
      "string.case": "Username must be in lowercase",
      "any.required": "Username is a required field",
    }),
  password: joi.string().trim().min(8).max(30).required().messages({
    "string.base": "Password should be a type of string",
    "string.empty": "Password cannot be an empty field",
    "string.min": "Password should have a minimum length of {#limit}",
    "string.max": "Password should have a minimum length of {#limit}",
    "any.required": "Password is a required field",
  }),
});

const registerUser = asyncHandler(async (req, res) => {
  // Validating user data
  const validateResult = registerJoiSchema.validate(req.body);
  if (validateResult.error) {
    const message = validateResult.error.details[0].message;
    throw new ApiError(400, message);
  }

  const { fullname, email, username, password } = req.body;

  // Check if user already exist
  const isUserExisted = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserExisted) {
    throw new ApiError(409, "Username or Email already exists");
  }

  //
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
  } catch (error) {
    throw new ApiError(409, "Failed to upload avatar");
  }

  let coverImage;
  try {
    if (coverImageLocalPath) {
      coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }
  } catch (error) {
    throw new ApiError(409, "Failed to upload cover image");
  }

  try {
    // creating new user
    const newUser = await User.create({
      fullname,
      avatar: avatar?.url || "",
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    // getting new created user
    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering a user");
    }

    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User registered successfully"));
  } catch (error) {
    if (avatar) {
      await deleteFromCloundinary(avatar.public_id);
    }
    if (coverImage) {
      await deleteFromCloundinary(coverImage.public_id);
    }
    console.log(error);
    throw new ApiError(500, "Something went wrong while registering a users");
  }
});

// validation schema for userlogin data
const loginJoiSchema = joi.object({
  username: joi.string().trim().messages({
    "any.required": "Username is a required field",
  }),
  password: joi.string().trim().required().messages({
    "any.required": "Password is a required field",
  }),
});

const loginUser = asyncHandler(async (req, res) => {
  // Validating user data
  const validateResult = loginJoiSchema.validate(req.body);
  if (validateResult.error) {
    const message = validateResult.error.details[0].message;
    throw new ApiError(400, message);
  }

  const { username, password } = req.body;

  // Check if user already exist
  const isUserExisted = await User.findOne({
    $or: [{ username }],
  });

  if (!isUserExisted) {
    throw new ApiError(404, "Username not found");
  }

  // matching password
  const isPasswordMatch = await isUserExisted.isPasswordCorrect(password);
  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid username or password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    isUserExisted._id
  );

  const loggedInUser = await User.findById(isUserExisted._id).select(
    "-password -refreshToken"
  );

  let options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    { new: true }
  );

  let options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = req.cookie.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Token expired");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Token expired");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Token expired");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    let options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, { user: user, accessToken }, "Token refreshed")
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong");
  }
};

const getUserChannelProfile = async (req, res) => {
  const { username } = req.params;

  if (!username.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase().trim(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscriberedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscriberedToCount: {
          $size: "$subscriberedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?.id, "$subscriptions.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        username: 1,
        fullname: 1,
        avatar: 1,
        subscribersCount: 1,
        channelSubscriberedToCount: 1,
        isSubscribed: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (channel?.length) {
    throw new ApiError(400, "Channel not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Channel Profile"));
};
const getWatchHistory = async (req, res) => {
  const watchHistory = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?.id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
      },
    },
  ]);
};

export { registerUser, loginUser, logoutUser, refreshAccessToken };

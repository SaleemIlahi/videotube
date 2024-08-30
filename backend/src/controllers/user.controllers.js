import { asyncHandler } from "../utils/asyncHandler.js";
import joi from "joi";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloundinary,
} from "../utils/cloudinary.js";

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
    "string.base": "Username should be a type of string",
    "string.empty": "Username cannot be an empty field",
    "string.min": "Username should have a minimum length of {#limit}",
    "string.max": "Username should have a minimum length of {#limit}",
    "any.required": "Username is a required field",
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

  if (!avatarLocalPath) {
    throw new ApiError(409, "Avatar image is missing");
  }
  
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
    console.log(error)
    throw new ApiError(500, "Something went wrong while registering a users");
  }
});

export { registerUser };

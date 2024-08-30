import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

// config env again for cloudinary
dotenv.config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const cloudinaryReponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "videotube",
    });
    console.log(`File uploaded on cloudinary. File src: ${cloudinaryReponse.url}`);
    fs.unlinkSync(localFilePath);
    return cloudinaryReponse;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloundinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloundinary };

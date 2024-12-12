import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return "Does not find File Path";
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File is uploded successfully", uploadResult.url);
    console.log(localFilePath);

    fs.unlinkSync(localFilePath);

    return uploadResult;
  } catch (error) {
    console.error(error);

    fs.unlinkSync(localFilePath);

    return null;
  }
};

export { uploadOnCloudinary };

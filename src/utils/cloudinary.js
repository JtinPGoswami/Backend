import { v2 as cloudinary } from "cloudinary";
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
    fs.unlinkSync(localFilePath);
    return uploadResult;
  } catch (error) {
    console.error(error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};
const deletFileFromCloudinary = async (filePublicId) => {
  try {
    if (!filePublicId) return "Does not find File Path";
    const deletedFile = await cloudinary.uploader.destroy(filePublicId);

    return deletedFile;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export { uploadOnCloudinary, deletFileFromCloudinary };

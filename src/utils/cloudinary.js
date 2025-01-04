import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Set up cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer memory storage (files will be stored in memory instead of the local disk)
const storage = multer.memoryStorage();

// Multer upload middleware
const upload = multer({ storage: storage });

// Upload file to Cloudinary directly from memory
const uploadOnCloudinary = async (file) => {
  try {
    if (!file) return "No file found";

    const uploadResult = await cloudinary.uploader.upload_stream(
      {
        resource_type: "auto", // Automatically detect file type (image, video, etc.)
      },
      (error, result) => {
        if (error) {
          console.error(error);
          return null;
        }
        return result;
      }
    );

    // Pipe the file buffer to Cloudinary
    uploadResult.end(file.buffer); // `file.buffer` is the file in memory

    return uploadResult;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Delete file from Cloudinary using its public ID
const deleteFileFromCloudinary = async (filePublicId) => {
  try {
    if (!filePublicId) return "No file public ID found";

    const deletedFile = await cloudinary.uploader.destroy(filePublicId);
    return deletedFile;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFileFromCloudinary, upload };

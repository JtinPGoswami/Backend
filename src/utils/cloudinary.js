import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});``

const uploadOnCloudinary = async (fileBuffer) => {
  try {
    if (!fileBuffer) throw new Error("No file buffer provided");

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(fileBuffer); // Pass the buffer to the stream
    });

    return uploadResult; // Returns { url, public_id, etc. }
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    return null;
  }
};

const deletFileFromCloudinary = async (filePublicId) => {
  try {
    if (!filePublicId) throw new Error("No file public ID provided");
    const deletedFile = await cloudinary.uploader.destroy(filePublicId);
    return deletedFile;
  } catch (error) {
    console.error("Cloudinary deletion error:", error.message);
    return null;
  }
};

export { uploadOnCloudinary, deletFileFromCloudinary };
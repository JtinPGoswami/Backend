import { Room } from "../models/room.model.js";
import { apiError } from "../utils/apiError.js";
import { apiRes } from "../utils/apiRes.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deletFileFromCloudinary,
} from "../utils/cloudinary.js";

const updateRoomDetails = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    location,
    city,
    state,
    address,
    pincode,
    suitableFor,
    people,
    rent,
    advance,
    discount,
    features,
    phone,
    availability,
    _id,
  } = req.body;
  if (
    [
      title,
      description,
      location,
      city,
      state,
      address,
      pincode,
      suitableFor,
      people,
      rent,
      advance,
      discount,
      features,
      phone,
      availability,
      _id,
    ].some(
      (item) =>
        item === undefined ||
        item === null ||
        (typeof item === "string" && item.trim() === "")
    )
  ) {
    throw new apiError(400, "All fields are required");
  }

  const room = await Room.findById(_id);
  if (!room) {
    throw new apiError(404, "user not found");
  }
  room.title = title;
  room.description = description;
  room.location = location;
  room.city = city;
  room.state = state;
  room.address = address;
  room.pincode = pincode;
  room.suitableFor = suitableFor;
  room.people = people;
  room.rent = rent;
  room.advance = advance;
  room.discount = discount;
  room.features = features;
  room.phone = phone;
  room.availability = availability;

  const updatedRoom = await room.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new apiRes(200, updatedRoom, "room details updated successfully "));
});

const updateRoomImages = asyncHandler(async (req, res) => {
  if (
    !req.files ||
    !Array.isArray(req.files.roomImages) ||
    req.files.roomImages.length === 0
  ) {
    throw new apiError(
      400,
      "At least one image of the room is required for listing"
    );
  }

  const { roomId } = req.body;
  if (!roomId) {
    throw new apiError(400, "Room ID is required");
  }

  const room = await Room.findById(roomId);
  if (!room) {
    throw new apiError(404, "Room not found");
  }

  let uploadedImageUrls = [];
  try {
    const uploadPromises = req.files.roomImages.map((file) =>
      uploadOnCloudinary(file.path)
    );
    const uploadResults = await Promise.all(uploadPromises);
    uploadedImageUrls = uploadResults.map((upload) => upload.url);
  } catch (error) {
    throw new apiError(500, "Failed to upload new images to Cloudinary");
  }

  if (uploadedImageUrls.length > 0) {
    const oldImages = room.photos || [];

    const deletePromises = oldImages.map((url) => {
      const urlParts = url.split("/");
      const fileNameWithExtension = urlParts[urlParts.length - 1];
      const fileName = fileNameWithExtension.split(".")[0];
      const shortFileName = urlParts.slice(-2, -1)[0] + "/" + fileName;
      const publicIdArray = shortFileName.split("/");
      const publicId = publicIdArray[1];
      return deletFileFromCloudinary(publicId);
    });

    try {
      await Promise.all(deletePromises);
    } catch (error) {
      throw new apiError(500, "Failed to delete old images from Cloudinary");
    }
  }

  room.photos = uploadedImageUrls;
  await room.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(
      new apiRes(
        200,
        { images: uploadedImageUrls },
        "Room images updated successfully"
      )
    );
});

export { updateRoomDetails, updateRoomImages };

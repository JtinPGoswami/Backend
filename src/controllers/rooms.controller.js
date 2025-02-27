import { LandLord } from "../models/landlord.model.js";
import { Room } from "../models/room.model.js";
import { apiError } from "../utils/apiError.js";
import { apiRes } from "../utils/apiRes.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const ListRooms = asyncHandler(async (req, res) => {
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
    availability,
  } = req.body;

  const isRoom = await Room.findOne({ location, address });

  if (isRoom) {
    throw new apiError(
      409,
      "A room with the same location and address already exists"
    );
  }

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
      availability,
    ].some(
      (item) =>
        item === undefined ||
        item === null ||
        (typeof item === "string" && item.trim() === "")
    )
  ) {
    throw new apiError(
      400,
      "All fields are required. Please ensure no fields are left empty"
    );
  }

  if (
    !req.files ||
    !Array.isArray(req.files.roomImages) ||
    req.files.roomImages.length === 0
  ) {
    throw new apiError(
      400,
      "Please upload at least one image to list the room."
    );
  }

  const uploadImg = await Promise.all(
    req.files.roomImages.map((file) => uploadOnCloudinary(file.buffer))
  );

  const uploadedImageUrls = uploadImg
    .filter((upload) => upload && upload.url)
    .map((upload) => upload.url);

  if (uploadedImageUrls.length === 0) {
    throw new apiError(400, "Failed to upload any images");
  }

  const featuresArray = features.split(",").map((feature) => feature.trim());

  let createdRoom;
  try {
    createdRoom = await Room.create({
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
      features: featuresArray,
      availability,
      photos: uploadedImageUrls,
      ownerID: req.user._id,
    });
  } catch (error) {
    await Promise.all(
      uploadedImageUrls.map((url) => {
        const publicId = url.split("/").pop().split(".")[0]; // Extract public_id
        return deletFileFromCloudinary(publicId);
      })
    );
    throw new apiError(500, "Room listing failed. Please try again");
  }

  if (!createdRoom) {
    throw new apiError(500, "Room listing failed. Please try again");
  }

  const loggedinUser = await LandLord.findById(req.user._id);
  loggedinUser.rooms.push(createdRoom._id);
  loggedinUser.save({ validateBeforeSave: false });

  res.status(200).json(new apiRes(200, "Room listed successfully"));
});


const FindListedRoomByLandLord = asyncHandler(async (req, res) => {
  const { ownerID } = req.body;
  const rooms = await Room.find({ ownerID });
  if (!rooms) {
    throw new apiError(404, "No rooms listed by you ");
  }
  res.status(200).json(new apiRes(200, rooms));
});

const deletListedRoomByLandLord = asyncHandler(async (req, res) => {
  const { roomId } = req.body;
  const user = req.user;

  if (!roomId) {
    throw new apiError(404, "Room ID not found");
  }
  const landlord = await LandLord.findById(user._id);
  if (!landlord) {
    throw new apiError(404, "Landlord not found");
  }
  landlord.rooms = landlord.rooms.filter((room) => room.toString() !== roomId);

  landlord.save({ validateBeforeSave: false });

  const deletedRoom = await Room.findByIdAndDelete(roomId);

  res
    .status(200)
    .json(new apiRes(200, deletedRoom, "Room deleted successfully."));
});

const getAllRooms = asyncHandler(async (req, res) => {
  try {
    const rooms = await Room.find({});
    if (!rooms || rooms.length === 0) {
      throw new apiError(404, "No rooms found");
    }

    const roomsWithOwners = await Promise.all(
      rooms.map(async (room) => {
        const ownerId = room.ownerID;
        if (!ownerId) {
          throw new apiError(
            404,
            `The room with ID ${room._id} has no associated ownerId`
          );
        }

        const owner = await LandLord.findById(ownerId);
        if (!owner) {
          throw new apiError(
            404,
            `The owner was not found for room with ID: ${room._id}`
          );
        }

        return { ...room.toObject(), owner: owner.toObject() };
      })
    );

    res
      .status(200)
      .json(new apiRes(200, roomsWithOwners, "Rooms retrieved successfully"));
  } catch (error) {
    console.error("Error in getting all rooms:", error.message);
    res
      .status(error.statusCode || 500)
      .json(new apiRes(error.statusCode || 500, null, error.message));
  }
});

export {
  ListRooms,
  FindListedRoomByLandLord,
  deletListedRoomByLandLord,
  getAllRooms,
};

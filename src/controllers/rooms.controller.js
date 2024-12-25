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
  console.log("people", people);

  const isRoom = await Room.findOne({ location, address });

  if (isRoom) {
    throw new apiError(
      409,
      "Land with the same location and address is already present"
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
    throw new apiError(400, "All fields are required");
  }

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

  const uploadImg = await Promise.all(
    req.files.roomImages.map((file) => uploadOnCloudinary(file.path))
  );

  const uploadedImageUrls = uploadImg.map((upload) => upload.url);

  const featuresArray = features.split(",").map((feature) => feature.trim());

  const createdRoom = await Room.create({
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

  if (!createdRoom) {
    throw new apiError(500, "Room listing failed, please try again");
  }

  const LoggedinUser = await LandLord.findById(req.user._id);

  LoggedinUser.rooms.push(createdRoom._id);

  LoggedinUser.save({ validateBeforeSave: false });

  res.status(200).json(new apiRes(200, "Room listed successfully"));
});

const FindListedRoomByLandLord = asyncHandler(async (req, res) => {
  const { ownerID } = req.body;
  const rooms = await Room.find({ ownerID });
  if (!rooms) {
    throw new apiError(404, "No Room listed by you ");
  }
  res.status(200).json(new apiRes(200, rooms));
});

const deletListedRoomByLandLord = asyncHandler(async (req, res) => {
  const { roomId } = req.body;
  const user = req.user;

  if (!roomId) {
    throw new apiError(404, "Room Id not found");
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
    .json(new apiRes(200, deletedRoom, "Room deleted successfully "));
});

const getAllRooms = asyncHandler(async (req, res) => {
  try {
    // Fetch all rooms
    const rooms = await Room.find({});
    if (!rooms || rooms.length === 0) {
      throw new apiError(404, "Rooms not found");
    }

    // Fetch owners for each room
    const roomsWithOwners = await Promise.all(
      rooms.map(async (room) => {
        // Ensure ownerId is handled as ObjectId
        const ownerId = room.ownerID;
        if (!ownerId) {
          throw new apiError(404, `Room with ID ${room._id} has no ownerId`);
        }

        const owner = await LandLord.findById(ownerId);
        if (!owner) {
          throw new apiError(
            404,
            `Owner not found for room with ID: ${room._id}`
          );
        }

        // Return room with owner data
        return { ...room.toObject(), owner: owner.toObject() };
      })
    );

    // Respond with rooms and their owners
    res
      .status(200)
      .json(new apiRes(200, roomsWithOwners, "Rooms fetched successfully"));
  } catch (error) {
    console.error("Error in getAllRooms:", error.message);
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

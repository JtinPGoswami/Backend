import { LandLord } from "../models/landlord.model.js";
import { Room } from "../models/room.model.js";
import { apiError } from "../utils/apiError.js";
import { apiRes } from "../utils/apiRes.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const ListRooms = asyncHandler(async (req, res) => {
  //get rooms data from frountend
  //validate imp data present or not
  //get images
  //set images on cloudinary  and store the urls
  //create room and set in data base
  // get id of room

  //get logged in user data from req.user (via middleware)
  //get user from db
  //set room id in user.rooms
  // save user
  //send response

  const {
    title,
    description,
    location,
    state,
    address,
    pincode,
    suitableFor,
    rent,
    advance,
    discount,
    features,
    availability,
  } = req.body;

  if (
    [
      title,
      description,
      location,
      state,
      address,
      pincode,
      suitableFor,
      rent,
      availability,
    ].some(
      (item) =>
        item.trim() === "" || item === undefined || item === null || item === ""
    )
  ) {
    throw new apiError(400, "All fileds are require");
  }
  console.log(req.files.roomImages.length, Array.isArray(req.files.roomImages));

  if (
    !req.files ||
    !Array.isArray(req.files.roomImages) ||
    req.files.roomImages.length === 0
  ) {
    throw new apiError(
      400,
      "At least one image of Room is require for listing "
    );
  }

  const uploadImg = await Promise.all(
    req.files.roomImages.map((file) => uploadOnCloudinary(file.path))
  );

  const uploadedImageUrls = uploadImg.map((upload) => upload.url);

  const createdRoom = await Room.create({
    title,
    description,
    location,
    state,
    address,
    pincode,
    suitableFor,
    rent,
    advance,
    discount,
    features,
    availability,
    photos: uploadedImageUrls,
  });

  if (!createdRoom) {
    throw new apiError(500, "Room Listing fail try again ");
  }
  const roomId = createdRoom._id;

  const LoggedinUser = await LandLord.findById(req.user._id);

  LoggedinUser.rooms.push(roomId);

  LoggedinUser.save({ validateBeforeSave: false });

  res.status(200).json(new apiRes(200, "Room listed successfully"));
});

export { ListRooms };

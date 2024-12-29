import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import {
  deletFileFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { apiRes } from "../utils/apiRes.js";
import { Admin } from "../models/admin.model.js";
import { findUserById, findUserByIdAndDelete } from "../utils/findUserInDB.js";
import { Room } from "../models/room.model.js";
import { RoomSeeker } from "../models/roomSeeker.model.js";
import { LandLord } from "../models/landlord.model.js";
import {
  sendRoomDeleteEmail,
  sendUserDeleteEmail,
} from "../middlewares/email.js";
// const registerAdmin = asyncHandler(async (req, res) => {
//   //get user details from frontend
//   //validation not empty
//   //chack if user already exists:username,email
//   // chack for porfile pic
//   // upload profile pic on cloudinary
//   //create user object create intry in db
//   // remove sensitive info from object
//   // chack for user creation

//   // return responce

//   const { email, password, username, name } = req.body;

//   if ([email, password, username, name].some((item) => item?.trim() === "")) {
//     throw new apiError(400, "All fileds are require");
//   }

//   const existedUser = await Admin.findOne({
//     $or: [{ username }, { email }],
//   });

//   if (existedUser) {
//     throw new apiError(409, "user with Username or email already exists");
//   }

//   let profiePicLocalPath;

//   if (
//     req.file &&
//     Array.isArray(req.file.profilePic) &&
//     req.file.profilePic.length > 0
//   ) {
//     profiePicLocalPath = req.file.profilePic.path;
//   }

// const verficationToken = Math.floor(
//   100000 + Math.random() * 900000
// ).toString();

//   const profilePic = await uploadOnCloudinary(profiePicLocalPath);

//   const user = await Admin.create({
//     name,
//     email,
//     password,
//     username,
//     ProfilePic: profilePic.url,
//     role: "admin",
// verficationToken,
//     verficationTokenExpiry: Date.now() + 15 * 60 * 1000,
//   });

// await sendVerificationEmail(user.email, verficationToken);
//   const createdUser = await Admin.findById(user._id).select(
//     "-password "
//   );
//   if (!createdUser) {
//     throw new apiError(500, "Something went wrong while registring the user ");
//   }

//   res
//     .status(200)
//     .json(new apiRes(200, createdUser, "user registration success"));
// });

const deleteRoomById = asyncHandler(async (req, res) => {
  const { roomId, message, userId } = req.body;

  const landlord = await LandLord.findById(userId);
  if (!landlord) {
    throw new apiError(404, "Landlord not found");
  }

  if (!landlord.rooms.includes(roomId)) {
    throw new apiError(404, "Room not listed under this landlord");
  }

  landlord.rooms = landlord.rooms.filter((room) => room.toString() !== roomId);
  await landlord.save({ validateBeforeSave: false });

  const RoomToDelete = await Room.findById(roomId);
  if (!RoomToDelete) {
    throw new apiError(404, "Room not found for deletion");
  }

  const images = RoomToDelete.photos;
  const deletePromises = images.map((url) => {
    const urlParts = url.split("/");
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const fileName = fileNameWithExtension.split(".")[0];
    const shortFileName = urlParts.slice(-2, -1)[0] + "/" + fileName;
    const publicIdArray = shortFileName.split("/");
    const publicId = publicIdArray[1];
    deletFileFromCloudinary(publicId);
  });

  try {
    await Promise.all(deletePromises);
  } catch (error) {
    throw new apiError(500, "Failed to delete images from Cloudinary");
  }

  const deletedRoom = await Room.findByIdAndDelete(RoomToDelete._id);
  if (!deletedRoom) {
    throw new apiError(500, "Something went wrong while deleting the room");
  }
  let defaultmessage = message;
  if (!message) {
    defaultmessage =
      "This room listing has been removed by the admin. Please contact support for further details";
  }
  await sendRoomDeleteEmail(
    landlord.name,
    deletedRoom.title,
    defaultmessage,
    landlord.email
  );
  res
    .status(200)
    .json(new apiRes(200, deletedRoom, "Room deletion successful"));
});

const deleteUserById = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    throw new apiError(400, "invalid credentials");
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new apiError(404, "user not found");
  }
  if (user.role === "landlord") {
    const landlord = user;

    const rooms = await Room.find({ ownerID: userId }); // Get all rooms belonging to this landlord
    if (rooms.length > 0) {
      // Log rooms to verify them before deleting

      // Delete images from Cloudinary for all rooms before deletion
      const deletePromises = rooms.map((room) => {
        const images = room.photos;
        return images.map((url) => {
          const urlParts = url.split("/");
          const fileNameWithExtension = urlParts[urlParts.length - 1];
          const fileName = fileNameWithExtension.split(".")[0];
          const shortFileName = urlParts.slice(-2, -1)[0] + "/" + fileName;
          const publicIdArray = shortFileName.split("/");
          const publicId = publicIdArray[1];
          deletFileFromCloudinary(publicId); // Assume deletFileFromCloudinary is a function to delete images
        });
      });

      // Wait for all the delete promises to resolve
      try {
        await Promise.all(deletePromises.flat()); // Flatten the array of promises
      } catch (error) {
        throw new apiError(500, "Failed to delete images from Cloudinary");
      }

      // Now delete all rooms
      await Room.deleteMany({ ownerID: userId }); // Delete rooms associated with this landlord
    }

    // Remove the rooms reference from the landlord's document (Optional, if needed)
    landlord.rooms = [];
    await landlord.save();

    // Finally, delete the landlord
  }

  const deletedUser = await findUserByIdAndDelete(userId);
  if (!deletedUser) {
    throw new apiError(400, "Error occurred while deleting the user");
  }

  await sendUserDeleteEmail(user.name, user.email);
  res
    .status(200)
    .json(new apiRes(200, deletedUser, "User deleted successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const seeker = await RoomSeeker.find({});
  if (!seeker) {
    throw new apiError(404, "room seeker not found");
  }
  const landlord = await LandLord.find({});
  if (!landlord) {
    throw new apiError(404, "laldlord not found");
  }
  const users = [...seeker, ...landlord];
  res.status(200).json(new apiRes(200, users, "users fetched successfully "));
});

export { deleteRoomById, deleteUserById, getAllUsers };

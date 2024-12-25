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
//     throw new apiError(400, "All fileds are reuqire");
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
//   const profilePic = await uploadOnCloudinary(profiePicLocalPath);

//   const user = await Admin.create({
//     name,
//     email,
//     password,
//     username,
//     ProfilePic: profilePic.url,
//     role: "admin",
//   });

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
  const { roomId, massage } = req.body;
  console.log("from backend ", roomId);

  if (!roomId) {
    throw new apiError(404, "Room id not found");
  }

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

  const deletedRoom = await Room.findByIdAndDelete(roomId);
  if (!deletedRoom) {
    throw new apiError(500, "something went wrong while deleting the room");
  }

  res
    .status(200)
    .json(
      new apiRes(200, { deletedRoom, massage }, "Room deleted successfully ")
    );
});

const deleteUserById = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  console.log("userId", userId);

  // Find the user to delete
  const userToDelete = await findUserById(userId);
  if (!userToDelete) {
    throw new apiError(404, "User not found");
  }

  const oldProfilePic = userToDelete.ProfilePic;
  if (oldProfilePic) {
    const urlParts = oldProfilePic.split("/");
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const fileName = fileNameWithExtension.split(".")[0];
    const shortFileName = urlParts.slice(-2, -1)[0] + "/" + fileName;
    const publicIdArray = shortFileName.split("/");
    const publicId = publicIdArray[1];
    await deletFileFromCloudinary(publicId);
  }
  let roomDeletionPromises = [];
  if (userToDelete.rooms) {
    roomDeletionPromises = userToDelete.rooms.map(async (roomId) => {
      try {
        const roomDeletionMessage = `Room deleted as part of user deletion.`;
        await deleteRoomById({
          body: { roomId, massage: roomDeletionMessage },
        });
      } catch (error) {
        console.error(`Error deleting room with ID ${roomId}:`, error);
      }
    });
  }

  await Promise.all(roomDeletionPromises);

  const deletedUser = await findUserByIdAndDelete(userId);
  if (!deletedUser) {
    throw new apiError(500, "Failed to delete user");
  }

  res
    .status(200)
    .json(new apiRes(200, { deletedUser }, "User deleted successfully"));
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
  res.status(200).json(new apiRes(200, users, "users fatched successfully "));
});

const getAllRoom = asyncHandler(async (req, res) => {
  const rooms = await Room.find({});
  if (!rooms) {
    throw new apiError(404, "Rooms not found ");
  }
  res.status(200).json(new apiRes(200, rooms, "Rooms fatched successfully "));
});

const viewListedRoomByUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    throw new apiError(400, "User ID is required");
  }
  const rooms = await Room.find({ ownerID: userId });
  if (!rooms || rooms.length === 0) {
    throw new apiError(404, "No rooms found for this user");
  }
  res.status(200).json(new apiRes(200, rooms, "Rooms fetched successfully"));
});

export {
  deleteRoomById,
  deleteUserById,
  getAllRoom,
  getAllUsers,
  viewListedRoomByUser,
};

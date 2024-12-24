import { RoomSeeker } from "../models/roomSeeker.model.js";
import { LandLord } from "../models/landlord.model.js";
import { Admin } from "../models/admin.model.js";
import asyncHandler from "./asyncHandler.js";
import { apiError } from "./apiError.js";

const findUserById = async (userId) => {
  if (!userId) {
    throw new apiError(401, "user id Invalid credentials");
  }
  let user = await RoomSeeker.findById(userId);
  if (!user) {
    user = await LandLord.findById(userId);
  }
  if (!user) {
    user = await Admin.findById(userId);
  }
  return user;
};
const findUserByIdAndRemoveSensitiveInfo = async (_id) => {
  if (!_id) {
    throw new apiError(401, "Invalid credentials");
  }
  let user = await RoomSeeker.findById(_id).select("-password ");
  if (!user) {
    user = await LandLord.findById(_id).select("-password ");
  }
  if (!user) {
    user = await Admin.findById(_id).select("-password ");
  }
  return user;
};

const findUserByUsername = async (username) => {
  if (!username) {
    throw new apiError(401, "Invalid credentials");
  }
  let user = await RoomSeeker.findOne(username);
  if (!user) {
    user = await LandLord.findOne(username);
  }
  if (!user) {
    user = await Admin.findOne(username);
  }
  return user;
};

const findUserByEmail = async (email) => {
  if (!email) {
    throw new apiError(401, "Invalid credentials");
  }

  let user = await RoomSeeker.findOne(email);
  if (user) {
    return user;
  }

  user = await LandLord.findOne(email);
  if (user) {
    return user;
  }

  user = await Admin.findOne(email);
  if (user) {
    return user;
  }

  return null;
};

const findUserByEmailAndDelete = async (email) => {
  if (!email) {
    throw new apiError(401, "Invalid credentials");
  }
  let deletedUser = await RoomSeeker.findOneAndDelete({ email });
  if (!deletedUser) {
    deletedUser = await LandLord.findOneAndDelete({ email });
  }
  return deletedUser;
};
export {
  findUserById,
  findUserByEmail,
  findUserByUsername,
  findUserByIdAndRemoveSensitiveInfo,
  findUserByEmailAndDelete,
};

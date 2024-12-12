import { RoomSeeker } from "../models/roomSeeker.model.js";
import { LandLord } from "../models/landlord.model.js";
import { Admin } from "../models/admin.model.js";
import asyncHandler from "./asyncHandler.js";
import { apiError } from "./apiError.js";

const findUserById = asyncHandler(async ({ userId }) => {
  if (!userId) {
    throw new apiError(401, "Invalid credentials");
  }
  let user = await RoomSeeker.findById(userId);
  if (!user) {
    user = await LandLord.findById(userId);
  }
  if (!user) {
    user = await Admin.findById(userId);
  }
  return user;
});
const findUserByIdAndRemoveSensitiveInfo = asyncHandler(async (_id) => {
  if (!_id) {
    throw new apiError(401, "Invalid credentials");
  }
  let user = await RoomSeeker.findById(_id).select("-password -refreshToken");
  if (!user) {
    user = await LandLord.findById(_id).select("-password -refreshToken");
  }
  if (!user) {
    user = await Admin.findById(_id).select("-password -refreshToken");
  }
  return user;
});

const findUserByUsername = asyncHandler(async (username) => {
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
});

const findUserByEmail = asyncHandler(async (email) => {
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
});

export {
  findUserById,
  findUserByEmail,
  findUserByUsername,
  findUserByIdAndRemoveSensitiveInfo,
};

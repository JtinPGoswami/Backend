import { RoomSeeker } from "../models/roomSeeker.model.js";
import { LandLord } from "../models/landlord.model.js";
import { Admin } from "../models/admin.model.js";
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
const findUserByEmailAndRemoveSensitiveInfo = async (email) => {
  if (!email) {
    throw new apiError(401, "Invalid credentials");
  }
  let user = await RoomSeeker.findOne({ email }).select("-password ");
  if (!user) {
    user = await LandLord.findOne({ email }).select("-password ");
  }
  if (!user) {
    user = await Admin.findOne({ email }).select("-password ");
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

  let user = await RoomSeeker.findOne({ email });
  if (user) {
    return user;
  }

  user = await LandLord.findOne({ email });
  if (user) {
    return user;
  }

  user = await Admin.findOne({ email });
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
const findUserByIdAndDelete = async (userId) => {
  if (!userId) {
    throw new apiError(401, "Invalid credentials");
  }
  let deletedUser = await RoomSeeker.findByIdAndDelete(userId);
  if (!deletedUser) {
    deletedUser = await LandLord.findByIdAndDelete(userId);
  }
  return deletedUser;
};

const findUserByOtp = async (otp) => {
  if (!otp) {
    throw new apiError(401, "user id Invalid credentials");
  }
  let user = await RoomSeeker.findOne({ verificationToken: otp });
  if (!user) {
    user = await LandLord.findOne({ verificationToken: otp });
  }
  if (!user) {
    user = await Admin.findOne({ verificationToken: otp });
  }
  return user;
};
const findUserByPassOtp = async (otp) => {
  if (!otp) {
    throw new apiError(401, "user id Invalid credentials");
  }
  let user = await RoomSeeker.findOne({ passwordverificationToken: otp });
  if (!user) {
    user = await LandLord.findOne({ passwordverificationToken: otp });
  }
  if (!user) {
    user = await Admin.findOne({ passwordverificationToken: otp });
  }
  return user;
};
export {
  findUserById,
  findUserByEmail,
  findUserByUsername,
  findUserByIdAndRemoveSensitiveInfo,
  findUserByEmailAndDelete,
  findUserByIdAndDelete,
  findUserByOtp,
  findUserByPassOtp,
  findUserByEmailAndRemoveSensitiveInfo,
};

import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { LandLord } from "../models/landlord.model.js";
import { RoomSeeker } from "../models/roomSeeker.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiRes } from "../utils/apiRes.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findUserByEmailAndRemoveSensitiveInfo,
  findUserById,
  findUserByIdAndRemoveSensitiveInfo,
} from "../utils/findUserInDB.js";
import { Admin } from "../models/admin.model.js";
import { Room } from "../models/room.model.js";
import { sendVerificationEmail } from "../middlewares/email.js";
const registerSeeker = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation not empty
  //chack if user already exists:username,email
  // chack for porfile pic
  // upload profile pic on cloudinary
  //create user object create intry in db
  // remove sensitive info from object
  // chack for user creation

  // return responce

  const { email, password, username, name, phone, gender, age, profession } =
    req.body;

  if (
    [email, password, username, name, phone, gender, age, profession].some(
      (item) => typeof item !== "string" || item.trim() === ""
    )
  ) {
    throw new apiError(400, "All fileds are reuqired");
  }

  const existedUser = await RoomSeeker.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, "user with Username or email already exists");
  }

  let profiePicLocalPath;

  if (
    req.file &&
    Array.isArray(req.file.profilePic) &&
    req.file.profilePic.length > 0
  ) {
    profiePicLocalPath = req.file.profilePic.path;
  }
  const profilePic = await uploadOnCloudinary(profiePicLocalPath);
  const verficationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  const user = await RoomSeeker.create({
    name,
    email,
    password,
    username,
    phone,
    gender,
    age,
    profession,
    ProfilePic: profilePic.url,
    role: "seeker",
    verficationToken,
    verficationTokenExpiry: Date.now() + 15 * 60 * 1000,
  });

  await sendVerificationEmail(user.email, verficationToken);
  const createdUser = await RoomSeeker.findById(user._id).select("-password ");
  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registring the user ");
  }

  res
    .status(200)
    .json(new apiRes(200, createdUser, "user registration success"));
});
const landlordRegister = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation not empty
  //chack if user already exists:username,email
  // chack for porfile pic
  // upload profile pic on cloudinary
  //create user object create intry in db
  // remove sensitive info from object
  // chack for user creation

  // return responce

  const { name, email, password, username, phone, rooms } = req.body;

  if (
    [name, email, username, password, phone, rooms].some(
      (item) => typeof item === "string" && item.trim() === ""
    )
  ) {
    throw new apiError(400, "All fileds are required");
  }

  const landOwner = await LandLord.findOne({
    $or: [{ username }, { email }],
  });

  if (landOwner) {
    throw new apiError(
      409,
      "User with the same username or email already exists"
    );
  }

  let ProfilePicLocalPath;
  if (
    req.file &&
    Array.isArray(req.file.profilePic) &&
    req.file.profilePic.length > 0
  ) {
    ProfilePicLocalPath = req.file.profilePic[0].path;
  }

  const profilePic = await uploadOnCloudinary(ProfilePicLocalPath);
  const verficationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const landlord = await LandLord.create({
    name,
    email,
    password,
    username,
    phone,
    ProfilePic: profilePic.url || "",
    rooms,
    role: "landlord",
    verficationToken,
    verficationTokenExpiry: Date.now() + 15 * 60 * 1000,
  });

  await sendVerificationEmail(landlord.email, verficationToken);
  const createLandLord = await LandLord.findById(landlord._id).select(
    "-password "
  );
  if (!createLandLord) {
    throw new apiError(500, "Something went wrong while registering the  user");
  }

  res
    .status(200)
    .json(new apiRes(200, createLandLord, "user registration success"));
});
const genrateAccessToken = async (userId) => {
  try {
    const user = await findUserById(userId);

    if (!user) {
      throw new apiError(404, "User not found");
    }

    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    return { accessToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new apiError(400, " Invalid credentials");
  }
  let user = await RoomSeeker.findOne({ username });
  if (!user) {
    user = await LandLord.findOne({ username });
  }
  if (!user) {
    user = await Admin.findOne({ username });
  }

  if (!user) {
    throw new apiError(404, "user does not exist");
  }

  if (user.role === "seeker") {
    if (!user.isVerified) {
      throw new apiError(401, "user's email is not verified");
    }
  }
  const validatePassword = await bcrypt.compare(password, user.password);
  if (!validatePassword) {
    throw new apiError(401, "invalid credentials");
  }

  const { accessToken } = await genrateAccessToken(user._id);

  if (!accessToken) {
    throw new apiError(
      500,
      "something went wrong while generating access token"
    );
  }

  const loggedInUser = await findUserByIdAndRemoveSensitiveInfo(user._id);

  const isProduction = process.env.NODE_ENV === "production";

  const options = {
    httpOnly: true,
    secure: isProduction, // Secure cookies in production
    sameSite: isProduction ? "None" : "Lax", // Cross-site support in production
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new apiRes(
        200,
        { user: loggedInUser, accessToken },
        `${user.role} logged in successfully`
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  const options = {
    httpOnly: true,
    secure: isProduction, // Secure cookies in production
    sameSite: isProduction ? "None" : "Lax", // Cross-site support in production
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new apiRes(200, {}, "logged out successfully "));
});

const getCurrentUser = async (req, res) => {
  res.status(200).json(new apiRes(200, req.user, "current user is fetched"));
};
const getUserById = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new apiError(400, "invalid credentials");
  }
  const user = await findUserByEmailAndRemoveSensitiveInfo(email);
  res.status(200).json(new apiRes(200, user, "user fetched successfully "));
};

const getLandLords = async (req, res) => {
  const LandLords = await LandLord.find({});
  if (!LandLords) {
    throw new apiError(404, "Landlord not found");
  }

  res
    .status(200)
    .json(new apiRes(200, LandLords, "Landlords fetched successfully "));
};

const viewListedRoomByUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    throw new apiError(400, "User ID is required");
  }

  const rooms = await Room.find({ ownerID: userId });
  if (!rooms || rooms.length === 0) {
    throw new apiError(404, "No rooms found for this user");
  }
  const roomsWithOwners = await Promise.all(
    rooms.map(async (room) => {
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

  res
    .status(200)
    .json(new apiRes(200, roomsWithOwners, "Rooms fetched successfully"));
});

export {
  landlordRegister,
  registerSeeker,
  loginUser,
  logoutUser,
  getCurrentUser,
  getUserById,
  getLandLords,
  viewListedRoomByUser,
};

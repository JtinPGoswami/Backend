import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { LandLord } from "../models/landlord.model.js";
import { RoomSeeker } from "../models/roomSeeker.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiRes } from "../utils/apiRes.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findUserById,
  findUserByIdAndRemoveSensitiveInfo,
} from "../utils/findUserInDB.js";
import { Admin } from "../models/admin.model.js";
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
    throw new apiError(400, "All fileds are reuqire");
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
  });

  const createdUser = await RoomSeeker.findById(user._id).select(
    "-password -refreshToken"
  );
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
    throw new apiError(400, "All fileds are require");
  }

  const landOwner = await LandLord.findOne({
    $or: [{ username }, { email }],
  });
  if (landOwner) {
    throw new apiError(409, "user with Username or email is already exists");
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

  const landlord = await LandLord.create({
    name,
    email,
    password,
    username,
    phone,
    ProfilePic: profilePic.url || "",
    rooms,
    role: "landlord",
  });

  const createLandLord = await LandLord.findById(landlord._id).select(
    "-password -refreshToken"
  );
  if (!createLandLord) {
    throw new apiError(500, "something went wrong while registring user");
  }

  res
    .status(200)
    .json(new apiRes(200, createLandLord, "user registration success"));
});
const genrateAccessAndRefreshToken = async (userId) => {
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

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    throw new apiError(400, " username require");
  }
  let user = await RoomSeeker.findOne({ username });
  if (!user) {
    user = await LandLord.findOne({ username });
  }
  if (!user) {
    user = await Admin.findOne({ username });
  }

  // const user = await findUserByUsername({ username });

  if (!user) {
    throw new apiError(404, "user does not exist");
  }

  const validatePassword = await bcrypt.compare(password, user.password);
  if (!validatePassword) {
    throw new apiError(401, "invalid credentials");
  }

  const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(
    user._id
  );

  if (!accessToken) {
    throw new apiError(
      500,
      "something went wrong while generating access token"
    );
  }

  const loggedInUser = await findUserByIdAndRemoveSensitiveInfo(user._id);

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiRes(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        `${user.role} logged in successfully`
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  let user = RoomSeeker.findByIdAndUpdate(req.user._id, {
    refreshToken: undefined,
  });

  if (!user) {
    user = LandLord.findByIdAndUpdate(req.user._id, {
      refreshToken: undefined,
    });
  }
  if (!user) {
    user = Admin.findByIdAndUpdate(req.user._id, {
      refreshToken: undefined,
    });
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiRes(200, {}, "logged out successfully "));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshTokne =
    req.cookies.refreshToken || refreshAccessToken.body.refreshToken;

  if (!incomingRefreshTokne) {
    throw new apiError(401, "Unorthorizes request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshTokne,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await findUserById(decodedToken?._id);

    if (!user) {
      throw new apiError(401, "Invalid refresh token");
    }

    if (incomingRefreshTokne !== user?.refreshToken) {
      throw new apiError(401, "Refresh token in expired or used");
    }

    const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new apiRes(200, { accessToken, refreshToken }, "Token refreshed "));
  } catch (error) {
    throw new apiError(401, error?.massage || "Invalid refresh token ");
  }
});

const getCurrentUser = async (req, res) => {
  res.status(200).json(new apiRes(200, req.user, "current user is fatched"));
};
export {
  landlordRegister,
  registerSeeker,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
};

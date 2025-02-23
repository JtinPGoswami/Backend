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
const registerSeeker = asyncHandler(async (req, res, next) => {
  try {
    const { email, password, username, name, phone, gender, age, profession } =
      req.body;

    if (
      [email, password, username, name, phone, gender, age, profession].some(
        (item) => typeof item !== "string" || item.trim() === ""
      )
    ) {
      throw new apiError(400, "All fields are required");
    }

    const existedUser = await RoomSeeker.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser) {
      throw new apiError(
        409,
        "User with this Username or Email already exists"
      );
    }

    let profilePicUrl = "https://default-avatar.com/default.png";
    if (req.file && req.file.path) {
      const profilePic = await uploadOnCloudinary(req.file.path);
      if (!profilePic || !profilePic.url) {
        throw new apiError(500, "Failed to upload profile picture");
      }
      profilePicUrl = profilePic.url;
    }

    const session = await RoomSeeker.startSession();
    session.startTransaction();

    try {
      const verificationToken = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      const user = await RoomSeeker.create(
        [
          {
            name,
            email,
            password,
            username,
            phone,
            gender,
            age,
            profession,
            profilePic: profilePicUrl,
            role: "seeker",
            verificationToken,
            verificationTokenExpiry: Date.now() + 15 * 60 * 1000,
          },
        ],
        { session }
      );

      await sendVerificationEmail(user[0].email, verificationToken);

      await session.commitTransaction();
      session.endSession();

      const createdUser = await RoomSeeker.findById(user[0]._id).select(
        "-password"
      );
      res
        .status(201)
        .json(new apiRes(201, createdUser, "User registration successful"));
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

const landlordRegister = asyncHandler(async (req, res) => {
  const { name, email, password, username, phone, rooms } = req.body;

  // Validate required fields
  if (
    [name, email, username, password, phone, rooms].some(
      (item) => typeof item === "string" && item.trim() === ""
    )
  ) {
    throw new apiError(400, "All fields are required.");
  }

  // Check if user already exists (username or email)
  const existingLandlord = await LandLord.findOne({
    $or: [{ username }, { email }],
  });

  if (existingLandlord) {
    throw new apiError(
      409,
      "A landlord with this username or email already exists."
    );
  }

  // Handle profile picture upload
   let profilePicUrl = "https://default-avatar.com/default.png";
  if (req.file) {
    profilePicUrl = await uploadOnCloudinary(req.file.path);
  }

  // Generate verification token
  const verificationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  // Create landlord in the database
  const landlord = await LandLord.create({
    name,
    email,
    password,
    username,
    phone,
    ProfilePic: profilePicUrl?.url || null, // Ensure it's either a URL or null
    rooms,
    role: "landlord",
    verificationToken,
    verificationTokenExpiry: Date.now() + 15 * 60 * 1000, // 15 min expiry
  });

  // Send verification email
  await sendVerificationEmail(landlord.email, verificationToken);

  // Retrieve created landlord without password
  const createdLandlord = await LandLord.findById(landlord._id).select(
    "-password"
  );

  if (!createdLandlord) {
    throw new apiError(
      500,
      "An error occurred while registering the landlord. Please try again."
    );
  }

  res
    .status(201)
    .json(new apiRes(201, createdLandlord, "Landlord registered successfully."));
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
    secure: isProduction, 
    sameSite: "none", 
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
    sameSite: "None" , // Cross-site support in production
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

import { Admin } from "../models/admin.model.js";
import { LandLord } from "../models/landlord.model.js";
import { RoomSeeker } from "../models/roomSeeker.model.js";
import { apiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { findUserByIdAndRemoveSensitiveInfo } from "../utils/findUserInDB.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new apiError(401, "Unauthorized request: Token not found");
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      console.error("JWT Verification Error:", err.message);
      throw new apiError(401, "Invalid or expired access token");
    }

    const userId = decodedToken?._id;

    const user = await findUserByIdAndRemoveSensitiveInfo(userId);

    if (!user) {
      console.error("User not found for ID:", userId);
      throw new apiError(401, "Invalid access token: User does not exist");
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error in verifyJWT Middleware:", error.message);
    throw new apiError(401, error?.message || "Unauthorized request");
  }
});

const isLandLord = asyncHandler(async (req, _, next) => {
  console.log(req.user);
  req.user;
  try {
    if (req.user.role !== "landlord") {
      throw new apiError(401, "Unauthorized request");
    }
    console.log("lalndlord is logged in ");
    next();
  } catch (error) {
    throw new apiError(401, error?.masssage || "Unauthorized request ");
  }
});

const isSeeker = asyncHandler(async (req, _, next) => {
  try {
    if (req.user.role !== "seeker") {
      throw new apiError(401, "Unauthorized request");
    }
    next();
  } catch (error) {
    throw new apiError(401, error?.masssage || "Unauthorized request");
  }
});

const isAdmin = asyncHandler(async (req, _, next) => {
  try {
    if (req.user.role !== "admin") {
      throw new apiError(401, "Unauthorized request");
    }
    next();
  } catch (error) {
    throw new apiError(401, error?.masssage || "Unauthorized request");
  }
});

export { verifyJWT, isLandLord, isAdmin, isSeeker };

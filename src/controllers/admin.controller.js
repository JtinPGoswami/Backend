import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiRes } from "../utils/apiRes.js";
import { Admin } from "../models/admin.model.js";

const registerAdmin = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation not empty
  //chack if user already exists:username,email
  // chack for porfile pic
  // upload profile pic on cloudinary
  //create user object create intry in db
  // remove sensitive info from object
  // chack for user creation

  // return responce

  const { email, password, username, name } = req.body;

  if ([email, password, username, name].some((item) => item?.trim() === "")) {
    throw new apiError(400, "All fileds are reuqire");
  }

  const existedUser = await Admin.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, "user with Username or email already exists");
  }

  let profiePicLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.profilePic) &&
    req.files.profilePic.length > 0
  ) {
    profiePicLocalPath = req.files.profilePic.path;
  }
  const profilePic = await uploadOnCloudinary(profiePicLocalPath);

  const user = await Admin.create({
    name,
    email,
    password,
    username,
    ProfilePic: profilePic.url,
    role: "admin",
  });

  const createdUser = await Admin.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registring the user ");
  }

  res
    .status(200)
    .json(new apiRes(200, createdUser, "user registration success"));
});

export { registerAdmin };

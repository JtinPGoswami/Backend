import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiRes } from "../utils/apiRes.js";
import { LandLord } from "../models/landlord.model.js";
import { RoomSeeker } from "../models/roomSeeker.model.js";
import { Admin } from "../models/admin.model.js";
import {
  findUserById,
  findUserByIdAndRemoveSensitiveInfo,
} from "../utils/findUserInDB.js";
import {
  deletFileFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confNewPassword } = req.body;
  console.log(
    "password is coming to the backend",
    oldPassword,
    newPassword,
    confNewPassword
  );

  if (!oldPassword || !newPassword || !confNewPassword) {
    throw new apiError(400, "All fileds are require");
  }
  if (!(newPassword === confNewPassword)) {
    throw new apiError(400, "password does not match");
  }

  const user = await findUserById(req.user._id);
  if (!user) {
    throw new apiError(401, "Invalid Access Token");
  }

  const isPasswordCorrect = await user.isPasswordCorrect;

  if (!isPasswordCorrect) {
    throw new apiError(400, "Invalid old password");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  res.status(200).json(new apiRes(200, {}, "password change successfully"));
});
// const updateName = asyncHandler(async (req, res) => {
//   const { name } = req.body;

//   if (!name) {
//     throw new apiError(400, "Name is require for updating");
//   }

//   const user = await findUserById(req.user._id);

//   if (!user) {
//     throw new apiError(404, "user not found ");
//   }
//   user.name = name;

//   const updatedUser = await user.save({ validateBeforeSave: false });
//   const newuser = await findUserByIdAndRemoveSensitiveInfo(updatedUser._id);

//   res.status(200).json(new apiRes(200, newuser, "name updated successfully "));
// });

const updateProfilePic = asyncHandler(async (req, res) => {
  const profiePicLocalPath = req.file.path;
  console.log(profiePicLocalPath);

  if (!profiePicLocalPath) {
    throw new apiError(400, "profile pic is require for update");
  }

  const user = await findUserById(req.user._id);
  if (!user) {
    throw new apiError(404, "user not found");
  }
  const oldProfilePic = user.ProfilePic;

  const urlParts = oldProfilePic.split("/");
  const fileNameWithExtension = urlParts[urlParts.length - 1];
  const fileName = fileNameWithExtension.split(".")[0];
  const shortFileName = urlParts.slice(-2, -1)[0] + "/" + fileName;
  const publicIdArray = shortFileName.split("/");
  const publicId = publicIdArray[1];

  let PF;
  try {
    PF = await uploadOnCloudinary(profiePicLocalPath);
  } catch (error) {
    throw new apiError(
      400,
      "something went wrong while uploding file on coludinary"
    );
  }

  user.ProfilePic = PF.url;

  const updatedUser = await user.save({ validateBeforeSave: false });

  const newuser = await findUserByIdAndRemoveSensitiveInfo(updatedUser._id);

  const deletedFile = await deletFileFromCloudinary(publicId);
  res
    .status(200)
    .json(
      new apiRes(
        200,
        { newuser, deletedFile },
        "profile pic updated successfully"
      )
    );
});
// const updatePhone = asyncHandler(async (req, res) => {
//   const { phone } = req.body;

//   if (!phone) {
//     throw new apiError(400, "phone number is require for updating");
//   }

//   const user = await findUserById(req.user._id);
//   if (!user) {
//     throw new apiError(404, "user not found ");
//   }

//   user.phone = phone;
//   const updatedUser = await user.save({ validateBeforeSave: false });
//   const newuser = await findUserByIdAndRemoveSensitiveInfo(updatedUser._id);

//   res
//     .status(200)
//     .json(new apiRes(200, newuser, "phone number updated successfully"));
// });
// const updateProfession = asyncHandler(async (req, res) => {
//   const { profession } = req.body;
//   if (!profession) {
//     throw new apiError(400, "profession is require for updating");
//   }
//   const user = await findUserById(req.user._id);
//   if (!user) {
//     throw new apiError(404, "user not found ");
//   }

//   user.profession = profession;
//   const updatedUser = await user.save({ validateBeforeSave: false });
//   const newuser = await findUserByIdAndRemoveSensitiveInfo(updatedUser._id);
//   res
//     .status(200)
//     .json(new apiRes(200, newuser, "profession updated successfully "));
// });
// const updateUsername = asyncHandler(async (req, res) => {
//   const { username } = req.body;
//   if (!username) {
//     throw new apiError(400, "username is require for updating");
//   }
//   const user = await findUserById(req.user._id);

//   if (!user) {
//     throw new apiError(404, "user not found ");
//   }

//   user.username = username;

//   const updatedUser = await user.save({ validateBeforeSave: false });
//   const newuser = await findUserByIdAndRemoveSensitiveInfo(updatedUser._id);

//   res
//     .status(200)
//     .json(new apiRes(200, newuser, "username updated successfully "));
// });

const updateUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.role === "landlord") {
    const { name, username, email, phone } = req.body;
    if (
      [name, email, username, phone].some(
        (item) => typeof item === "string" && item.trim() === ""
      )
    ) {
      throw new apiError(400, "All fileds are require");
    }
    const landOwner = await LandLord.findOne({
      $or: [{ username }, { email }],
    });
    landOwner.name = name;
    landOwner.username = username;
    landOwner.email = email;
    landOwner.phone = phone;
    await landOwner.save({ validateBeforeSave: false });
  } else if (user.role === "seeker") {
    const { name, email, username, phone, gender, age, profession } = req.body;
    if (
      [name, email, username, phone, gender, age, profession].some(
        (item) => typeof item === "string" && item.trim() === ""
      )
    ) {
      throw new apiError(400, "All fileds are require");
    }
    const seeker = await RoomSeeker.findOne({
      $or: [{ username }, { email }],
    });
    seeker.name = name;
    seeker.username = username;
    seeker.email = email;
    seeker.phone = phone;
    seeker.gender = gender;
    seeker.age = age;
    seeker.profession = profession;
    await seeker.save({ validateBeforeSave: false });
  } else if (user.role === "admin") {
    const { name, email, username } = req.body;
    if (
      [name, email, username].some(
        (item) => typeof item === "string" && item.trim() === ""
      )
    ) {
      throw new apiError(400, "All fileds are require");
    }
    const admin = await Admin.findOne({
      $or: [{ username }, { email }],
    });
    admin.name = name;
    admin.username = username;
    admin.email = email;

    await admin.save({ validateBeforeSave: false });
  }
  res.status(200).json(new apiRes(200, {}, "user found successfully"));
});
export { updatePassword, updateUser, updateProfilePic };

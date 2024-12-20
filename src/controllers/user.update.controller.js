import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiRes } from "../utils/apiRes.js";
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
const updateName = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new apiError(400, "Name is require for updating");
  }

  const user = await findUserById(req.user._id);

  if (!user) {
    throw new apiError(404, "user not found ");
  }
  user.name = name;

  const updatedUser = await user.save({ validateBeforeSave: false });
  const newuser = await findUserByIdAndRemoveSensitiveInfo(updatedUser._id);

  res.status(200).json(new apiRes(200, newuser, "name updated successfully "));
});

const updateProfilePic = asyncHandler(async (req, res) => {
  const profiePicLocalPath = req.file.path;
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
        { updatedUser, deletedFile },
        "profile pic updated successfully"
      )
    );
});
const updatePhone = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    throw new apiError(400, "phone number is require for updating");
  }

  const user = await findUserById(req.user._id);
  if (!user) {
    throw new apiError(404, "user not found ");
  }

  user.phone = phone;
  const updatedUser = await user.save({ validateBeforeSave: false });
  const newuser = await findUserByIdAndRemoveSensitiveInfo(updatedUser._id);

  res
    .status(200)
    .json(new apiRes(200, newuser, "phone number updated successfully"));
});
const updateProfession = asyncHandler(async (req, res) => {
  const { profession } = req.body;
  if (!profession) {
    throw new apiError(400, "profession is require for updating");
  }
  const user = await findUserById(req.user._id);
  if (!user) {
    throw new apiError(404, "user not found ");
  }

  user.profession = profession;
  const updatedUser = await user.save({ validateBeforeSave: false });
  const newuser = await findUserByIdAndRemoveSensitiveInfo(updatedUser._id);
  res
    .status(200)
    .json(new apiRes(200, newuser, "profession updated successfully "));
});
const updateUsername = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) {
    throw new apiError(400, "username is require for updating");
  }
  const user = await findUserById(req.user._id);

  if (!user) {
    throw new apiError(404, "user not found ");
  }

  user.username = username;

  const updatedUser = await user.save({ validateBeforeSave: false });
  const newuser = await findUserByIdAndRemoveSensitiveInfo(updatedUser._id);

  res
    .status(200)
    .json(new apiRes(200, newuser, "username updated successfully "));
});
export {
  updatePassword,
  updateName,
  updateProfession,
  updatePhone,
  updateUsername,
  updateProfilePic,
};

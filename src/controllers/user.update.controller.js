import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiRes } from "../utils/apiRes.js";
import { findUserById } from "../utils/findUserInDB.js";

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confNewPassword } = req.body;

  console.log("body :", req.body, "user :", req.user);
  console.log(oldPassword, newPassword, confNewPassword);

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

export { updatePassword };

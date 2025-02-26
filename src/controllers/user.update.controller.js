import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiRes } from "../utils/apiRes.js";
import { LandLord } from "../models/landlord.model.js";
import { RoomSeeker } from "../models/roomSeeker.model.js";
import { Admin } from "../models/admin.model.js";
import {
  findUserByEmail,
  findUserById,
  findUserByIdAndRemoveSensitiveInfo,
  findUserByOtp,
  findUserByPassOtp,
} from "../utils/findUserInDB.js";
import {
  deletFileFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import {
  sendRoleChangeInfo,
  sendRoleChangeVarificationCode,
  sendVerificationEmail,
  sendVerificationEmailForPasswordChange,
  sendWelcomeEmail,
} from "../middlewares/email.js";
import { Room } from "../models/room.model.js";
import bcrypt from "bcrypt";
const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confNewPassword } = req.body;

  // Check if all fields are provided
  if (!oldPassword || !newPassword || !confNewPassword) {
    throw new apiError(400, "All fields are required");
  }

  // Check if new password and confirm password match
  if (newPassword !== confNewPassword) {
    throw new apiError(400, "Passwords do not match");
  }

  // Find user by ID
  const user = await findUserById(req.user._id);
  if (!user) {
    throw new apiError(401, "Invalid access token");
  }

  // Verify old password
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new apiError(400, "Invalid old password");
  }

  // Update the password
  user.password = newPassword;

  // Save the user (assuming hashing is handled in the user model)
  await user.save();

  res.status(200).json(new apiRes(200, {}, "Password changed successfully"));
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
  const profilePicBuffer = req.file?.buffer; // Get buffer from memory storage

  if (!profilePicBuffer) {
    throw new apiError(400, "Profile picture is required for update");
  }

  const user = await findUserById(req.user._id);
  if (!user) {
    throw new apiError(404, "User not found");
  }

  const oldProfilePic = user.ProfilePic;
  let publicId = null;

  if (oldProfilePic) {
    try {
      const urlParts = oldProfilePic.split("/");
      const fileNameWithExtension = urlParts[urlParts.length - 1];
      const fileName = fileNameWithExtension.split(".")[0];
      const shortFileName = urlParts.slice(-2, -1)[0] + "/" + fileName;
      publicId = shortFileName.split("/")[1];
    } catch (error) {
      console.error("Error extracting public ID:", error.message);
    }
  }

  let PF;
  try {
    PF = await uploadOnCloudinary(profilePicBuffer); // Pass buffer instead of path
    if (!PF || typeof PF === "string") {
      throw new Error("Failed to upload file to Cloudinary");
    }
  } catch (error) {
    throw new apiError(400, error.message || "Error uploading to Cloudinary");
  }

  user.ProfilePic = PF.url;

  let updatedUser;
  try {
    updatedUser = await user.save({ validateBeforeSave: false });
  } catch (error) {
    await deletFileFromCloudinary(PF.public_id); // Clean up on failure
    throw new apiError(500, "Failed to update profile picture in database");
  }

  const newUser = await findUserByIdAndRemoveSensitiveInfo(updatedUser._id);

  let deletedFile = null;
  if (publicId) {
    try {
      deletedFile = await deletFileFromCloudinary(publicId);
    } catch (error) {
      console.error("Error deleting old profile picture:", error.message);
    }
  }

  res.status(200).json(
    new apiRes(200, { newUser, deletedFile }, "Profile picture updated successfully")
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
  let updatedUser = user;
  if (user.role === "landlord") {
    const { name, username, email, phone } = req.body;
    if (
      [name, email, username, phone].some(
        (item) => typeof item === "string" && item.trim() === ""
      )
    ) {
      throw new apiError(400, "All fileds are required");
    }
    const landOwner = await LandLord.findOne({
      $or: [{ username }, { email }],
    });
    landOwner.name = name;
    landOwner.username = username;
    landOwner.email = email;
    landOwner.phone = phone;
    updatedUser = await landOwner.save({ validateBeforeSave: false });
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
    updatedUser = await seeker.save({ validateBeforeSave: false });
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

    updatedUser = await admin.save({ validateBeforeSave: false });
  }
  res
    .status(200)
    .json(new apiRes(200, updatedUser, "user updated successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { inputOtp } = req.body;

  if (!inputOtp) {
    throw new apiError(400, "otp is undefine");
  }

  const user = await findUserByOtp(inputOtp);
  if (!user) {
    throw new apiError(401, "invalid or wrong otp");
  }

  if (Date.now() > user.verificationTokenExpiry) {
    throw new apiError(401, "otp has expired");
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  user.save({ validateBeforeSave: false });
  const verifiedUser = await findUserByIdAndRemoveSensitiveInfo(user._id);

  await sendWelcomeEmail(user.email, user.name);
  res
    .status(200)
    .json(new apiRes(200, verifiedUser, "email varified successfully"));
});
const verifyEmailAndUpdatePassword = asyncHandler(async (req, res) => {
  const { otp, password } = req.body;

  if (!otp || !password) {
    throw new apiError(400, "All fileds are required");
  }

  const user = await findUserByPassOtp(otp);
  if (!user) {
    throw new apiError(401, "invalid or wrong otp");
  }

  if (Date.now() > user.passwordverificationTokenExpiry) {
    throw new apiError(401, "otp has expired");
  }

  user.passwordverificationToken = undefined;
  user.passwordverificationTokenExpiry = undefined;
  user.password = password;

  user.save({ validateBeforeSave: false });

  await sendWelcomeEmail(user.email, user.name);
  res
    .status(200)
    .json(new apiRes(200, {}, "Password changed successfully successfully"));
});

const resendVerificationCode = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new apiError(401, "invalid credentials");
  }
  const user = await findUserByEmail(email);
  if (!user) {
    throw new apiError(404, `user not found for ${email}`);
  }

  const verificationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  const verificationTokenExpiry = Date.now() + 15 * 60 * 1000;

  user.verificationToken = verificationToken;
  user.verificationTokenExpiry = verificationTokenExpiry;
  user.save({ validateBeforeSave: false });

  await sendVerificationEmail(user.email, verificationToken);

  res.status(200).json(new apiRes(200, {}, "email send successfully "));
});

const sendPasswordVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new apiError(401, "invalid credentials");
  }
  const user = await findUserByEmail(email);
  if (!user) {
    throw new apiError(404, `user not found for ${email}`);
  }

  const passwordverificationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  const passwordverificationTokenExpiry = Date.now() + 15 * 60 * 1000;

  user.passwordverificationToken = passwordverificationToken;
  user.passwordverificationTokenExpiry = passwordverificationTokenExpiry;
  user.save({ validateBeforeSave: false });

  await sendVerificationEmailForPasswordChange(
    user.email,
    passwordverificationToken
  );

  res.status(200).json(new apiRes(200, {}, "email send successfully "));
});
const sendRoleUpdateVerificationCode = asyncHandler(async (req, res) => {
  const loginUser = req.user;

  const email = loginUser.email;

  if (!email) {
    throw new apiError(401, "invalid credentials");
  }
  const user = await findUserByEmail(email);
  if (!user) {
    throw new apiError(404, `user not found for ${email}`);
  }

  const roleUpdateverificationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  const roleUpdateverificationTokenExpiry = Date.now() + 15 * 60 * 1000;

  user.roleUpdateverificationToken = roleUpdateverificationToken;
  user.roleUpdateverificationTokenExpiry = roleUpdateverificationTokenExpiry;
  user.save({ validateBeforeSave: false });

  await sendRoleChangeVarificationCode(
    user.email,
    roleUpdateverificationToken,
    loginUser.role
  );

  res.status(200).json(new apiRes(200, {}, "email send successfully "));
});

const updateLandlordToSeeker = asyncHandler(async (req, res) => {
  const { gender, profession, age, password, otp } = req.body;

  const logInUser = req.user;
  const email = logInUser.email;

  if (!gender || !profession || !age || !email || !otp) {
    throw new apiError(400, "All fields are required");
  }

  if (!password) {
    throw new apiError(400, "password is require");
  }
  const validatePassword = await bcrypt.compare(password, logInUser.password);
  if (!validatePassword) {
    throw new apiError(401, "invalid credentials");
  }
  const user = await LandLord.findOne({ roleUpdateverificationToken: otp });
  if (!user) {
    throw new apiError(404, `User not found for the email ${email}`);
  }

  if (Date.now() > user.roleUpdateverificationTokenExpiry) {
    throw new apiError(401, "otp has expired");
  }

  user.roleUpdateverificationToken = undefined;
  user.roleUpdateverificationTokenExpiry = undefined;
  user.password = password;

  user.save({ validateBeforeSave: false });

  const landlord = await LandLord.findOne({ email });
  if (!landlord) {
    throw new apiError(404, `User not found for the email ${email}`);
  }

  const newUser = await RoomSeeker.create({
    name: landlord.name,
    email: landlord.email,
    password: password,
    username: landlord.username,
    phone: landlord.phone,
    gender,
    age,
    profession,
    ProfilePic: landlord.ProfilePic,
    role: "seeker",
    isVerified: true,
  });

  if (!newUser) {
    throw new apiError(500, "Something went wrong while changing role");
  }

  const userId = landlord._id;
  const rooms = await Room.find({ ownerID: userId });

  if (rooms.length > 0) {
    try {
      const deletePromises = rooms.flatMap((room) =>
        room.photos.map((url) => {
          const urlParts = url.split("/");
          const fileNameWithExtension = urlParts[urlParts.length - 1];
          const fileName = fileNameWithExtension.split(".")[0];
          const shortFileName = urlParts.slice(-2, -1)[0] + "/" + fileName;
          const publicIdArray = shortFileName.split("/");
          const publicId = publicIdArray[1];
          return deletFileFromCloudinary(publicId);
        })
      );

      await Promise.all(deletePromises);
      await Room.deleteMany({ ownerID: userId });
    } catch (error) {
      throw new apiError(500, "Failed to delete images from Cloudinary");
    }
  }

  const deletedLandlord = await LandLord.findOneAndDelete({ email });
  if (!deletedLandlord) {
    await RoomSeeker.findOneAndDelete({ email });
    throw new apiError(500, "Something went wrong while changing role");
  }

  await sendRoleChangeInfo(user.email, newUser.role);

  const isProduction = process.env.NODE_ENV === "production";

  const options = {
    httpOnly: true,
    secure: isProduction, // Secure cookies in production
    sameSite: "None" , // Cross-site support in production
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new apiRes(200, { user }, "User role changed successfully"));
});

const updateSeekarToLandlord = asyncHandler(async (req, res) => {
  const user = req.user;
  const { password, otp } = req.body;
  if (!password || !otp) {
    throw new apiError("invalid credentials");
  }
  const validatePassword = await bcrypt.compare(password, user.password);
  if (!validatePassword) {
    throw new apiError(401, "invalid credentials");
  }

  if (!user || !user.email) {
    throw new apiError(400, "Invalid user or email");
  }

  const email = user.email;
  const seeker = await RoomSeeker.findOne({ email });

  if (!seeker) {
    throw new apiError(404, `User  not found for email: ${email}`);
  }
  const verifiedUser = await RoomSeeker.findOne({
    roleUpdateverificationToken: otp,
  });

  if (!verifiedUser) {
    throw new apiError(401, "invalid or wrong otp");
  }

  if (Date.now() > verifiedUser.roleUpdateverificationTokenExpiry) {
    throw new apiError(401, "otp has expired");
  }

  verifiedUser.roleUpdateverificationToken = undefined;
  verifiedUser.roleUpdateverificationTokenExpiry = undefined;
  verifiedUser.password = password;

  verifiedUser.save({ validateBeforeSave: false });

  const newLandlord = await LandLord.create({
    name: seeker.name,
    email: seeker.email,
    password: password,
    username: seeker.username,
    phone: seeker.phone,
    ProfilePic: seeker.ProfilePic,
    role: "landlord",
    isVerified: true,
  });

  if (!newLandlord) {
    throw new apiError(500, "Something went wrong while changing user role");
  }

  const deletedSeeker = await RoomSeeker.findByIdAndDelete(user._id);

  if (!deletedSeeker) {
    await LandLord.findByIdAndDelete(newLandlord._id);
    throw new apiError(500, "Something went wrong while changing user role");
  }
  await sendRoleChangeInfo(user.email, newLandlord.role);

  const isProduction = process.env.NODE_ENV === "production";

  const options = {
    httpOnly: true,
    secure: isProduction, // Secure cookies in production
    sameSite:  "None" , // Cross-site support in production
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new apiRes(200, newLandlord, "User role changed successfully"));
});

export {
  updatePassword,
  updateUser,
  updateProfilePic,
  verifyEmail,
  verifyEmailAndUpdatePassword,
  resendVerificationCode,
  sendPasswordVerificationCode,
  updateLandlordToSeeker,
  updateSeekarToLandlord,
  sendRoleUpdateVerificationCode,
};

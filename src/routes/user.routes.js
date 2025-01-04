import { Router } from "express";
import { upload } from "../utils/cloudinary.js";

// import { registerAdmin } from "../controllers/admin.controller.js";
import {
  getCurrentUser,
  getLandLords,
  getUserById,
  landlordRegister,
  loginUser,
  logoutUser,
  registerSeeker,
  viewListedRoomByUser,
} from "../controllers/user.controller.js";
import { isLandLord, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deletListedRoomByLandLord,
  FindListedRoomByLandLord,
  getAllRooms,
  ListRooms,
} from "../controllers/rooms.controller.js";
import {
  resendVerificationCode,
  sendPasswordVerificationCode,
  sendRoleUpdateVerificationCode,
  updateLandlordToSeeker,
  updatePassword,
  updateProfilePic,
  updateSeekarToLandlord,
  updateUser,
  verifyEmail,
  verifyEmailAndUpdatePassword,
} from "../controllers/user.update.controller.js";
import {
  updateRoomDetails,
  updateRoomImages,
} from "../controllers/room.update.controller.js";
const router = Router();

router.route("/").post((req, res) => {
  res.status(200).json({ message: "working" });
});
router
  .route("/register/seeker")
  .post(upload.single("profilePic"), registerSeeker);

router
  .route("/register/landlord")
  .post(upload.single("profilePic"), landlordRegister);

// router
//   .route("/register/admin")
//   .post(upload.single("profilePic"), registerAdmin);

//secure Routes
router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/update/password").post(verifyJWT, updatePassword);
router.route("/update/user").post(verifyJWT, updateUser);

router
  .route("/update/profilepic")
  .post(verifyJWT, upload.single("profilePic"), updateProfilePic);

//user related routes
router.route("/current/user").get(verifyJWT, getCurrentUser);
router.route("/get/user").post(getUserById);
router.route("/get/landlords").get(getLandLords);

//room related routes
router
  .route("/list/room")
  .post(
    verifyJWT,
    isLandLord,
    upload.fields([{ name: "roomImages", maxCount: 5 }]),
    ListRooms
  );
router
  .route("/listed/room")
  .post(verifyJWT, isLandLord, FindListedRoomByLandLord);

router.route("/update/room").post(verifyJWT, isLandLord, updateRoomDetails);
router
  .route("/update/room/images")
  .post(
    verifyJWT,
    isLandLord,
    upload.fields([{ name: "roomImages", maxCount: 5 }]),
    updateRoomImages
  );
router
  .route("/delete/room")
  .post(verifyJWT, isLandLord, deletListedRoomByLandLord);

router.route("/get/landlord/rooms").post(viewListedRoomByUser);
router.route("/get/all/rooms").get(getAllRooms);

router.route("/verify/email").post(verifyEmail);
router.route("/resend/var/code").post(resendVerificationCode);

router.route("/send/pass/code").post(sendPasswordVerificationCode);
router.route("/verify/pass/code").post(verifyEmailAndUpdatePassword);

router
  .route("/send/role-update/email")
  .post(verifyJWT, sendRoleUpdateVerificationCode);
router.route("/update/to-landlord").post(verifyJWT, updateSeekarToLandlord);
router.route("/update/to-seeker").post(verifyJWT, updateLandlordToSeeker);

export default router;

import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

// import { registerAdmin } from "../controllers/admin.controller.js";
import {
  getCurrentUser,
  getUserById,
  landlordRegister,
  loginUser,
  logoutUser,
  registerSeeker,
} from "../controllers/user.controller.js";
import { isLandLord, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deletListedRoomByLandLord,
  FindListedRoomByLandLord,
  ListRooms,
} from "../controllers/rooms.controller.js";
import {
  updatePassword,
  updateProfilePic,
  updateUser,
} from "../controllers/user.update.controller.js";
import {
  updateRoomDetails,
  updateRoomImages,
} from "../controllers/room.update.controller.js";
const router = Router();

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
router.route("/update-password").post(verifyJWT, updatePassword);
router.route("/update-user").post(verifyJWT, updateUser);

router
  .route("/update-profilepic")
  .post(verifyJWT, upload.single("profilePic"), updateProfilePic);

//user related routes
router.route("/current-user").post(verifyJWT, getCurrentUser);
router.route("/get-user").post(verifyJWT, getUserById);

//room related routes
router
  .route("/list-room")
  .post(
    verifyJWT,
    isLandLord,
    upload.fields([{ name: "roomImages", maxCount: 5 }]),
    ListRooms
  );
router
  .route("/listed-room")
  .post(verifyJWT, isLandLord, FindListedRoomByLandLord);

router.route("/update-room").post(verifyJWT, isLandLord, updateRoomDetails);
router
  .route("/update-room/images")
  .post(
    verifyJWT,
    isLandLord,
    upload.fields([{ name: "roomImages", maxCount: 5 }]),
    updateRoomImages
  );
router
  .route("/delete-room")
  .post(verifyJWT, isLandLord, deletListedRoomByLandLord);

export default router;

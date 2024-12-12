import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

import { registerAdmin } from "../controllers/admin.controller.js";
import {
  landlordRegister,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerSeeker,
} from "../controllers/user.controller.js";
import { isLandLord, verifyJWT } from "../middlewares/auth.middleware.js";
import { ListRooms } from "../controllers/rooms.controller.js";
import { updatePassword } from "../controllers/user.update.controller.js";
const router = Router();

router
  .route("/register/seeker")
  .post(upload.fields([{ name: "profilePic", maxCount: 1 }]), registerSeeker);

router
  .route("/register/landlord")
  .post(upload.fields([{ name: "profilePic", maxCount: 1 }]), landlordRegister);

router
  .route("/register/admin")
  .post(upload.fields([{ name: "profilePic", maxCount: 1 }]), registerAdmin);

//secure Routes
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/reset-password").post(verifyJWT, updatePassword);

router
  .route("/list-room")
  .post(
    verifyJWT,
    isLandLord,
    upload.fields([{ name: "roomImages", maxCount: 5 }]),
    ListRooms
  );
export default router;

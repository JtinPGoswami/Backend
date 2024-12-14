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
import {
  updateName,
  updatePassword,
  updatePhone,
  updateProfession,
  updateProfilePic,
  updateUsername,
} from "../controllers/user.update.controller.js";
const router = Router();

router
  .route("/register/seeker")
  .post(upload.single("profilePic"), registerSeeker);

router
  .route("/register/landlord")
  .post(upload.single("profilePic"), landlordRegister);

router
  .route("/register/admin")
  .post(upload.single("profilePic"), registerAdmin);

//secure Routes
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/update-password").post(verifyJWT, updatePassword);
router.route("/update-name").post(verifyJWT, updateName);
router.route("/update-phone").post(verifyJWT, updatePhone);
router.route("/update-prof").post(verifyJWT, updateProfession);
router.route("/update-username").post(verifyJWT, updateUsername);
router
  .route("/update-profilepic")
  .post(verifyJWT, upload.single("profilePic"), updateProfilePic);

router
  .route("/list-room")
  .post(
    verifyJWT,
    isLandLord,
    upload.fields([{ name: "roomImages", maxCount: 5 }]),
    ListRooms
  );
export default router;

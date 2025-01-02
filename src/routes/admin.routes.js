import { Router } from "express";
import {
  deleteRoomById,
  deleteUserById,
  getAllUsers,
  registerAdmin,
} from "../controllers/admin.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(registerAdmin);

router.route("/get/users").post(verifyJWT, isAdmin, getAllUsers);

router.route("/delete/user").post(verifyJWT, isAdmin, deleteUserById);
router.route("/delete/room").post(verifyJWT, isAdmin, deleteRoomById);

export default router;

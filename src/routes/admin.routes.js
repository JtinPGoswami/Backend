import { Router } from "express";
import {
  deleteRoomById,
  deleteUserById,
  getAllRoom,
  getAllUsers,
  viewListedRoomByUser,
} from "../controllers/admin.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/get-users").post(verifyJWT, isAdmin, getAllUsers);
router.route("/get-rooms").post(verifyJWT, isAdmin, getAllRoom);

router.route("/get/all/rooms").post(verifyJWT, isAdmin, viewListedRoomByUser);

router.route("/delete/user").post(verifyJWT, isAdmin, deleteUserById);
router.route("/delete-room").post(verifyJWT, isAdmin, deleteRoomById);

export default router;

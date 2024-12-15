import { Router } from "express";
import { deleteUserByEmail } from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/delete-user").post(verifyJWT, deleteUserByEmail);

export default router;

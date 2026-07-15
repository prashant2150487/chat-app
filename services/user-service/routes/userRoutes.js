import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getMe,
  getUserById,
  getUserByUserName,
  updateMe,
} from "../controllers/userController.js";

const router = Router();

router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateMe);
router.get("/username/:username", authenticate, getUserByUserName);
router.get("/:id", authenticate, getUserById);

export default router;

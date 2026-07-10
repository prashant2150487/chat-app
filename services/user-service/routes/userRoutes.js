import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getMe,
  getUserById,
  getAllUsers,
} from "../controllers/userController.js";

const router = Router();

router.get("/me", authenticate, getMe);
router.get("/", authenticate, getAllUsers);
router.get("/:id", getUserById);

export default router;

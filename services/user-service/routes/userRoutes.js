import { Router } from "express";
import { getAllUsers, getUserById } from "../controllers/userController.js";
import { authenticate } from "../../auth-service/prisma/authMiddlewre.js";

const router = Router();

// Demo endpoint: GET /api/v1/users/:id

router.get("/:id", getUserById);
router.get("/", authenticate , getAllUsers);


export default router;

import { Router } from "express";
import { getAllUsers, getUserById } from "../controllers/userController.js";

const router = Router();

// Demo endpoint: GET /api/v1/users/:id
router.get("/:id", getUserById);
router.get("/", getAllUsers);


export default router;

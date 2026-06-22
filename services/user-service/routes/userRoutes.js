import { Router } from "express";
import { getDemoUser } from "../controllers/userController.js";

const router = Router();

// Demo endpoint: GET /api/v1/users/:id
router.get("/:id", getDemoUser);

export default router;

import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { blockedUsers, blockUser, unblockUser } from "../controllers/blockUserController.js";

const router = Router();

router.get("/", authenticate, blockedUsers);
router.post("/:userId", authenticate, blockUser);
router.delete("/:userId", authenticate, unblockUser);
export default router;

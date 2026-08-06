import { Router } from "express";
import { login, register, verifyOtp, refreshToken } from "../controllers/authController.js";

const router = Router();

router.post("/register", register)
router.post("/verify-otp", verifyOtp)
router.post("/login", login)
router.post("/refresh", refreshToken)

export default router;

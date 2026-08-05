import { Router } from "express";
import authRouter from "./authRoutes.js";
import userRouter from "./userRoutes.js";
import contactRouter from "./contactRoutes.js";
import blockUserRouter from "./blockUserRoutes.js";
import { requireInternalSecret } from "../middlewares/internalAuth.js";
import { createProfile } from "../controllers/userController.js";
import conversationRouter from "./conversationRoutes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "server",
    status: "ok",
  });
});

router.post("/internal/users", requireInternalSecret, createProfile);

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/contacts", contactRouter);
router.use("/blocks", blockUserRouter);
router.use("/conversations",conversationRouter)

export default router;

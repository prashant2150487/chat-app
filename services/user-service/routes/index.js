import { Router } from "express";
import userRouter from "./userRoutes.js";
import { requireInternalSecret } from "../middlewares/internalAuth.js";
import { createProfile } from "../controllers/userController.js";
import contactRouter from "./contactRoutes.js";
import blockUserRouter from "./blockUserRoutes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "user-service",
    status: "ok",
  });
});

// Internal: auth-service calls this on register (not exposed via gateway)
router.post("/internal/users", requireInternalSecret, createProfile);

router.use("/users", userRouter);
router.use("/contacts", contactRouter);
router.use("/blocks", blockUserRouter);

export default router;

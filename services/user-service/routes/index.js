import { Router } from "express";
import userRouter from "./userRoutes.js";
import { requireInternalSecret } from "../middlewares/internalAuth.js";
import { createProfile } from "../controllers/userController.js";

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

export default router;

import { Router } from "express";
import userRouter from "./userRoutes.js";

const router = Router();

router.get("/health", (req, res) => {
    res.status(200).json({ success: true, service: "user-service", status: "ok" });
});

router.use("/users", userRouter);

export default router;

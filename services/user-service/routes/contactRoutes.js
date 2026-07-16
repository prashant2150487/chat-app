import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { createContactByPhone, createContactByUserName } from "../controllers/contactController.js";




const router = Router();

router.post("/phone", authenticate, createContactByPhone)
router.post("/username", authenticate, createContactByUserName)
export default router;
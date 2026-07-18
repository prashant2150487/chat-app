import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  createContactByPhone,
  createContactByUserName,
  getContacts,
} from "../controllers/contactController.js";

const router = Router();

router.post("/phone", authenticate, createContactByPhone);
router.post("/username", authenticate, createContactByUserName);
router.get("/", authenticate, getContacts);

export default router;

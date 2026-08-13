import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { createConversation, getAllConversation, getConversationById  } from "../controllers/conversationController.js";
import { getMessageHistory } from "../controllers/messgeController.js";



const router = Router()
router.get("/", authenticate, getAllConversation)
router.post("/", authenticate, createConversation)
router.get("/:id", authenticate, getConversationById)
// router.delete("/:id", authenticate, deleteConversation)
// router.put("/:id/mute", authenticate, muteConversation);
// router.put("/:id/pin", authenticate, pinConversation);
// router.put("/:id/archive", authenticate, archiveConversation);
router.get("/:id/messages", authenticate, getMessageHistory );
// router.delete("/:id/message", authenticate, clearChatHistory);








export default router

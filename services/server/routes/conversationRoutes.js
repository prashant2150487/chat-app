import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getAllConversation, getConversationById } from "../controllers/conversationController.js";



const router = Router()
router.get("/", authenticate, getAllConversation)
router.get("/:id", authenticate, getConversationById)
// router.delete("/:id", authenticate, deleteConversation)
// router.put("/:id/mute", authenticate, muteConversation);
// router.put("/:id/pin", authenticate, pinConversation);
// router.put("/:id/archive", authenticate, archiveConversation);
// router.get("/:id/message", authenticate, getMessageHistory );
// router.delete("/:id/message", authenticate, clearChatHistory);








export default router

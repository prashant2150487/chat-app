import { prisma } from "../config/database.js"
import { AppError } from "../utils/appError.js"
import { HTTP_STATUS } from "../constants/httpStatus.js"



export const messageService = {

    getMessageHistory: async (conversationId, userId) => {
        // include participants so the membership check below doesn't crash
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: true },
        });

        if (!conversation) {
            throw new AppError("Conversation not found", HTTP_STATUS.NOT_FOUND)
        }

        const isMember = conversation.participants.some((p) => p.userId === userId)
        if (!isMember) {
            throw new AppError("You are not a participant of this conversation", HTTP_STATUS.FORBIDDEN)
        }

        // fetch and return the actual messages, not the conversation object
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "asc" },
        })

        return messages;
    }

}
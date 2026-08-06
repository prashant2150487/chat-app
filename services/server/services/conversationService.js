import { prisma } from "../config/database.js"
import { AppError } from "../utils/appError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";





export const conversationService = {
    getAllConversationsForUser: async (userId) => {
        if (!userId) {
            throw new AppError("Please provide userId", HTTP_STATUS.BAD_REQUEST)
        }
        const conversations = await prisma.conversation.findMany({
            where: {
                id: userId
            }
        })

        return conversations;
    },
    getConversationById: async (conversationId, userId) => {
        if (!conversationId) {
            throw new AppError("Please provide conversation id", HTTP_STATUS.BAD_REQUEST)
        }
        if (!userId) {
            throw new AppError("Please provide user id", HTTP_STATUS.BAD_REQUEST)
        }
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            }
        })
        if (!conversation) {
            throw new AppError("Conversation not found", HTTP_STATUS.NOT_FOUND)
        }
        if (conversation.participantIds.includes(userId)) {
            throw new AppError("You are not a participant of this conversation", HTTP_STATUS.BAD_REQUEST)
        }
        return conversation;
    },
    createConversation: async (userId, peerUserId) => {
        const existingConversation = await prisma.conversation.findFirst({
            where:{
                participantIds: {
                    has: userId,
                },
                participantIds: {
                    has: peerUserId
                }
            }
        })
        if (existingConversation) return existingConversation;
        const conversation = await prisma.conversation.create({
            data: {
                participantIds: [userId, peerUserId]
            }
        })
        return conversation;
    }
}
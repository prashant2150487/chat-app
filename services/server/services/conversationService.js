import { prisma } from "../config/database.js"
import { AppError } from "../utils/appError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const conversationService = {
    /**
     * Get all conversations where the given user is a participant.
     */
    getAllConversationsForUser: async (userId) => {
        if (!userId) {
            throw new AppError("Please provide userId", HTTP_STATUS.BAD_REQUEST)
        }
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: { userId }
                }
            },
            include: {
                participants: true
            },
            orderBy: { lastMessageAt: "desc" }
        })
        return conversations;
    },

    /**
     * Get a single conversation by ID, verifying the user is a participant.
     */
    getConversationById: async (conversationId, userId) => {
        if (!conversationId) {
            throw new AppError("Please provide conversation id", HTTP_STATUS.BAD_REQUEST)
        }
        if (!userId) {
            throw new AppError("Please provide user id", HTTP_STATUS.BAD_REQUEST)
        }
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: true }
        })
        if (!conversation) {
            throw new AppError("Conversation not found", HTTP_STATUS.NOT_FOUND)
        }
        const isMember = conversation.participants.some((p) => p.userId === userId)
        if (!isMember) {
            throw new AppError("You are not a participant of this conversation", HTTP_STATUS.FORBIDDEN)
        }
        return { conversation };
    },

    /**
     * Get or create a 1-on-1 (direct) conversation between two users.
     * Returns the existing conversation if one already exists.
     */
    createConversation: async (userId, peerUserId) => {
        // Find an existing direct conversation that has BOTH users as participants
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                type: "direct",
                participants: {
                    some: { userId }
                },
                AND: {
                    participants: {
                        some: { userId: peerUserId }
                    }
                }
            },
            include: { participants: true }
        })

        if (existingConversation) return existingConversation;

        // Create a new direct conversation with both participants
        const conversation = await prisma.conversation.create({
            data: {
                type: "direct",
                createdBy: userId,
                participants: {
                    create: [
                        { userId },
                        { userId: peerUserId }
                    ]
                }
            },
            include: { participants: true }
        })
        return conversation;
    }
}
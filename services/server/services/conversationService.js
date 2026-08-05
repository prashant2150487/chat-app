import { prisma } from "../config/database.js"





export const conversationService = {
    getAllConversationsForUser: async (userId) => {
        if (!userId) {
            throw new Error("Please provide userId")
        }
        const conversations = await prisma.conversation.findMany({
            where: {
                id: userId
            }
        })

        return conversations;
    },
    getConversationById: async (conversationId , userId)=>{
        if(!conversationId){
            throw new Error("Please provide conversation id")
        }
        if(!userId){
            throw new Error("Please provide user id")
        }
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            }
        })
        if(!conversation){
            throw new Error("Conversation not found")
        }
        if(conversation.participantIds.includes(userId)){
            throw new Error("You are not a participant of this conversation")
        }
        return conversation;
    }
}
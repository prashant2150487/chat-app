import axiosInstance from "@/config/axios"
import { BASE, ENDPOINTS } from "../endPoints"
import { ApiResponse, Conversation } from "../../types/api.types"

export const conversationService = {
  getAllConversations: async (): Promise<Conversation[]> => {
    try {
      const res = await axiosInstance.get<ApiResponse<Conversation[]>>(`${BASE}${ENDPOINTS.CHAT.CONVERSATIONS}`)
      return res.data.data ?? [] as Conversation[]
    } catch (err) {
      throw new Error("Failed to fetch conversations")
    }
  },

  getConversationById: async (id: string): Promise<Conversation> => {
    try {
      const res = await axiosInstance.get<ApiResponse<Conversation>>(`${BASE}${ENDPOINTS.CHAT.CONVERSATION(id)}`)
      if (!res.data.data) {
         throw new Error("Conversation not found")
      }
      return res.data.data
    } catch (err) {
      throw new Error("Failed to fetch conversation")
    }
  },

  createConversation: async (peerUserId: string): Promise<Conversation> => {
    try {
      const res = await axiosInstance.post<ApiResponse<Conversation>>(`${BASE}${ENDPOINTS.CHAT.CONVERSATIONS}`, { peerUserId })
      if (!res.data.data) {
         throw new Error("Failed to create conversation")
      }
      return res.data.data
    } catch (err) {
      throw new Error("Failed to create conversation")
    }
  },

  getConversationMessages: async (conversationId: string): Promise<any[]> => {
    try {
      const res = await axiosInstance.get<ApiResponse<any[]>>(`${BASE}${ENDPOINTS.CHAT.MESSAGES(conversationId)}`)
      return res.data.data ?? []
    } catch (err) {
      throw new Error("Failed to fetch messages")
    }
  }
}

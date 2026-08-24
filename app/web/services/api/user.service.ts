import axiosInstance from "@/config/axios"
import type {
  ApiResponse,
  UpdateProfilePayload,
  UserProfile,
} from "@/types/api.types"

const BASE = "/api/v1/users"

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response
      ?.data?.message === "string"
  ) {
    return (error as { response: { data: { message: string } } }).response.data
      .message
  }
  if (error instanceof Error) return error.message
  return "Something went wrong"
}

export const userService = {
  getMe: async (): Promise<UserProfile> => {
    try {
      const { data } =
        await axiosInstance.get<ApiResponse<UserProfile>>(`${BASE}/me`)
      if (!data.data) {
        throw new Error("User profile not found")
      }
      return data.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  updateMe: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    try {
      const { data } = await axiosInstance.patch<ApiResponse<UserProfile>>(
        `${BASE}/me`,
        payload,
      )
      if (!data.data) {
        throw new Error("Failed to update profile")
      }
      return data.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },
}

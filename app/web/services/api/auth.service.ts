import axiosInstance from "@/config/axios"
import {
  ApiResponse,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  User,
} from "@/types/api.types"
import { BASE } from "../endPoints"



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

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    try {
      const { data } = await axiosInstance.post<LoginResponse>(
        `${BASE}/auth/login`,
        payload,
      )
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    try {
      const { data } = await axiosInstance.post<RegisterResponse>(
        `${BASE}/register`,
        payload,
      )
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  logout: () => axiosInstance.post(`${BASE}/logout`),

  refresh: () => axiosInstance.post(`${BASE}/refresh`),

  getMe: async (): Promise<User> => {
    try {
      const { data } = await axiosInstance.get<ApiResponse<User>>(`${BASE}/me`)
      return data.data ?? (data as unknown as User)
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },
}

import { getAccessToken, getRefreshToken, setAuthTokens, clearAuthCookies } from "@/utils/cookies/client"
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, success = true) => {
  failedQueue.forEach((p) => (success ? p.resolve() : p.reject(error)))
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }
    if (!originalRequest) return Promise.reject(error)

    if (originalRequest.url?.includes("/auth/refresh")) {
      isRefreshing = false
      processQueue(error, false)
      clearAuthCookies()
      if (typeof window !== "undefined") window.location.href = "/login"
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => axiosInstance(originalRequest))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = getRefreshToken()
        if (!refreshToken) throw new Error("No refresh token available")

        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { refreshToken })
        const { token, refreshToken: newRefreshToken } = res.data

        if (token) {
          setAuthTokens(token, newRefreshToken || refreshToken)
          originalRequest.headers.Authorization = `Bearer ${token}`
        }

        processQueue(null, true)
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, false)
        clearAuthCookies()
        if (typeof window !== "undefined") window.location.href = "/login"
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance

export const COOKIE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
} as const

export const TOKEN_MAX_AGE = 60 * 15 // 15 minutes (access token)
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

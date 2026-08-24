import { COOKIE_KEYS, REFRESH_TOKEN_MAX_AGE, TOKEN_MAX_AGE } from "./constants"

function buildCookie(
  name: string,
  value: string,
  maxAge = TOKEN_MAX_AGE,
) {
  return `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function setAccessToken(token: string, maxAge = TOKEN_MAX_AGE) {
  if (typeof document === "undefined") return
  document.cookie = buildCookie(COOKIE_KEYS.ACCESS_TOKEN, token, maxAge)
}

export function setRefreshToken(token: string, maxAge = REFRESH_TOKEN_MAX_AGE) {
  if (typeof document === "undefined") return
  document.cookie = buildCookie(COOKIE_KEYS.REFRESH_TOKEN, token, maxAge)
}

export function getRefreshToken(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_KEYS.REFRESH_TOKEN}=([^;]*)`),
  )
  return match ? decodeURIComponent(match[1]) : null
}

export function setAuthTokens(accessToken: string, refreshToken?: string) {
  setAccessToken(accessToken)
  if (refreshToken) setRefreshToken(refreshToken)
}

export function getAccessToken(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_KEYS.ACCESS_TOKEN}=([^;]*)`),
  )
  return match ? decodeURIComponent(match[1]) : null
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return
  document.cookie = `${COOKIE_KEYS.ACCESS_TOKEN}=; path=/; max-age=0`
  document.cookie = `${COOKIE_KEYS.REFRESH_TOKEN}=; path=/; max-age=0`
}

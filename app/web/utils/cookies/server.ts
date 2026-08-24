import { cookies } from "next/headers"

import { COOKIE_KEYS } from "./constants"

export async function getServerAccessToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(COOKIE_KEYS.ACCESS_TOKEN)?.value
}

export async function getServerRefreshToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(COOKIE_KEYS.REFRESH_TOKEN)?.value
}

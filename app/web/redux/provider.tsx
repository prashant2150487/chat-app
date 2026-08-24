"use client"

import * as React from "react"
import { Provider } from "react-redux"

import { userService } from "@/services/api/user.service"
import { clearAuthCookies, getAccessToken } from "@/utils/cookies/client"

import { logout, setAuthStatus, setUser } from "./features/authSlice"
import { useAppDispatch } from "./hooks"
import { store } from "./store/store"

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  React.useEffect(() => {
    let cancelled = false

    async function hydrate() {
      const token = getAccessToken()

      if (!token) {
        dispatch(logout())
        return
      }

      const existingUser = store.getState().auth.user
      if (existingUser) {
        dispatch(setAuthStatus("ready"))
        return
      }

      dispatch(setAuthStatus("loading"))

      try {
        const profile = await userService.getMe()
        if (!cancelled) {
          dispatch(setUser(profile))
        }
      } catch {
        if (!cancelled) {
          clearAuthCookies()
          dispatch(logout())
        }
      }
    }

    void hydrate()

    return () => {
      cancelled = true
    }
  }, [dispatch])

  return <>{children}</>
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator>{children}</AuthHydrator>
    </Provider>
  )
}

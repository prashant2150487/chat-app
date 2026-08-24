import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { UserProfile } from "@/types/api.types"

type AuthStatus = "idle" | "loading" | "ready"

interface AuthState {
  user: UserProfile | null
  status: AuthStatus
}

const initialState: AuthState = {
  user: null,
  status: "idle",
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload
      state.status = action.payload ? "ready" : state.status
    },
    setAuthStatus: (state, action: PayloadAction<AuthStatus>) => {
      state.status = action.payload
    },
    logout: (state) => {
      state.user = null
      state.status = "ready"
    },
  },
})

export const { setUser, setAuthStatus, logout } = authSlice.actions
export default authSlice.reducer

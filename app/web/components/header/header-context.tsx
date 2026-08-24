"use client"

import * as React from "react"

export type HeaderInfo = {
  title: string
  subtitle?: string
}

type HeaderContextValue = {
  info: HeaderInfo
  setHeader: (info: HeaderInfo) => void
}

const HeaderContext = React.createContext<HeaderContextValue | null>(null)

const DEFAULT_HEADER: HeaderInfo = { title: "Chats" }

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [info, setInfo] = React.useState<HeaderInfo>(DEFAULT_HEADER)

  const setHeader = React.useCallback((next: HeaderInfo) => {
    setInfo(next)
  }, [])

  const value = React.useMemo(() => ({ info, setHeader }), [info, setHeader])

  return (
    <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>
  )
}

export function useHeader() {
  const ctx = React.useContext(HeaderContext)
  if (!ctx) {
    throw new Error("useHeader must be used within a HeaderProvider")
  }
  return ctx
}

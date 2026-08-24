"use client"

import * as React from "react"
import { CircleDot, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useHeader } from "./header-context"

export const Header: React.FC = () => {
  const { info } = useHeader()

  return (
    <header className="flex items-center justify-between gap-3 border-b bg-background px-4 py-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{info.title}</div>
        <div className="text-xs text-muted-foreground">
          {info.subtitle ?? "—"}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Users className="mr-1.5 size-4" />
          Members
        </Button>
        <Button variant="outline" size="icon" aria-label="More">
          <CircleDot className="size-4" />
        </Button>
      </div>
    </header>
  )
}

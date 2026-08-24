"use client"

import { Lock, MessageCircle } from "lucide-react"

export function ChatEmptyState() {
  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col items-center justify-center overflow-hidden bg-[#f0f2f5] px-8 dark:bg-muted/30">
      {/* subtle dot pattern — WhatsApp-style wallpaper */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.08) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
          <MessageCircle
            className="size-12 text-muted-foreground/70"
            strokeWidth={1.25}
          />
        </div>

        <h2 className="text-2xl font-light tracking-tight text-foreground/90">
          Chat App
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Select a contact from the list on the left to start a conversation.
          Your messages will appear here.
        </p>

        <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="size-3.5 shrink-0" />
          <span>Messages are private between you and your contacts</span>
        </div>
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { Send } from "lucide-react"

import { ChatEmptyState } from "@/components/chat/chat-empty-state"
import { MessageStatusTicks } from "@/components/chat/message-status-ticks"

import { cn, initials } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SubSidebar } from "@/components/sub-sidebar"
import { useHeader } from "@/components/header/header-context"
import { useAppSelector } from "@/redux/hooks"
import { conversationService } from "@/services/api/conversation.service"
import { contactService } from "@/services/api/contactServices"
import { contact } from "@/types/api.types"
import { useConversationSocket } from "@/hooks/useConversationSocket"
import { ChatMessagePayload, markMessageRead } from "@/lib/socket"
import { aggregateMessageStatus, patchMessageStatus } from "@/lib/message-status"
import { useRef } from "react"

async function getOrCreateConversation(contactUserId: string) {
  try {
    const allConversations = await conversationService.getAllConversations()
    const existing = (allConversations as any[]).find(
      (c) =>
        !c.isGroup &&
        Array.isArray(c.participants) &&
        c.participants.some((p: any) => p.userId === contactUserId || p.id === contactUserId)
    )
    if (existing) return existing.id
  } catch (_) {}

  const conv = await conversationService.createConversation(contactUserId)
  return conv.id
}

export function ChatShell() {
  const { user } = useAppSelector((state) => state.auth)
  const [contacts, setContacts] = React.useState<contact[]>([])
  const [activeContactId, setActiveContactId] = React.useState<string | null>(null)
  const [activeContactName, setActiveContactName] = React.useState<string | null>(null)
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null)

  const [messages, setMessages] = React.useState<ChatMessagePayload[]>([])
  const messagesRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = React.useState("")
  const [draft, setDraft] = React.useState("")
  const [peerTyping, setPeerTyping] = React.useState(false)

  const filteredContacts = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter((c) => c.contact.displayName?.toLowerCase().includes(q) || c.contact.username?.toLowerCase().includes(q))
  }, [query, contacts])

  const { setHeader } = useHeader()
  React.useEffect(() => {
    setHeader({
      title: activeContactName ?? "Chats",
      subtitle: peerTyping
        ? "typing..."
        : activeContactName
          ? "Online"
          : "Select a conversation",
    })
  }, [activeContactName, peerTyping, setHeader])

  const applyStatusUpdate = React.useCallback(
    (messageId: string, userId: string, status: "sent" | "delivered" | "read") => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, statuses: patchMessageStatus(m.statuses, userId, status) }
            : m,
        ),
      )
    },
    [],
  )

  const { sendMessge, isConnected, notifyTyping, stopTyping } = useConversationSocket(
    activeConversationId,
    {
      onMessage: (msg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev
          return [...prev, msg]
        })

        if (msg.senderId !== user?.id && activeConversationId) {
          markMessageRead(activeConversationId, msg.id)
        }
      },
      onMessageDelivered: ({ messageId, userId, status }) => {
        applyStatusUpdate(messageId, userId, status)
      },
      onMessageRead: ({ messageId, userId }) => {
        applyStatusUpdate(messageId, userId, "read")
      },
      onTypingStart: ({ userId }) => {
        if (userId !== user?.id) setPeerTyping(true)
      },
      onTypingStop: ({ userId }) => {
        if (userId !== user?.id) setPeerTyping(false)
      },
    },
  )

  React.useEffect(() => {
    async function loadMessages() {
      if (!activeConversationId || !user?.id) return;
      try {
        const history = await conversationService.getConversationMessages(activeConversationId)
        setMessages(history)

        const lastIncoming = [...history]
          .reverse()
          .find((m: ChatMessagePayload) => m.senderId !== user.id)
        if (lastIncoming) {
          markMessageRead(activeConversationId, lastIncoming.id)
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadMessages()
  }, [activeConversationId, user?.id])

  const handleSelectContact = async (contactUserId: string, name: string) => {
    setActiveContactId(contactUserId)
    setActiveContactName(name)
    setPeerTyping(false)
    setMessages([])
    try {
      const conversationId = await getOrCreateConversation(contactUserId)
      setActiveConversationId(conversationId)
    } catch (err) {
      console.error("Failed to get or create conversation:", err)
    }
  }

  React.useEffect(() => {
    const el = messagesRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  function onSend() {
    if (!draft.trim() || !isConnected || !activeConversationId) return
    stopTyping()
    sendMessge(draft)
    setDraft("")
  }
  const fetchContact = async ()=>{
    const res= await contactService.getContact()
    setContacts(res)
    console.log("Respoinse from contact", res)
  }

  React.useEffect(()=>{
    fetchContact()
  },[])

  return (
    <div className="grid h-full min-h-0 overflow-hidden grid-cols-[320px_1fr]">
      <SubSidebar
        conversations={filteredContacts}
        activeContactId={activeContactId}
        onSelectContact={handleSelectContact}
        query={query}
        onQueryChange={setQuery}
      />

      <main className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-background">
        {!activeConversationId ? (
          <ChatEmptyState />
        ) : (
          <>
            <div
              ref={messagesRef}
              className="scroll-area min-h-0 flex-1 bg-[#efeae2]/40 px-4 py-5 dark:bg-muted/20"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.04) 1px, transparent 0)`,
                backgroundSize: "20px 20px",
              }}
            >
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
                {messages.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                    <p className="rounded-full bg-background/80 px-4 py-2 text-xs text-muted-foreground shadow-sm ring-1 ring-border/40">
                      Messages are end-to-end private. Say hi to {activeContactName}!
                    </p>
                  </div>
                ) : null}
                {messages.map((m) => {
                  const mine = m.senderId === user?.id
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "flex w-full items-end gap-2",
                        mine ? "justify-end" : "justify-start",
                      )}
                    >
                      {!mine ? (
                        <Avatar className="size-8 ring-1 ring-border/60">
                          <AvatarFallback>{initials(activeContactName || "User")}</AvatarFallback>
                        </Avatar>
                      ) : null}

                      <div className={cn("max-w-[75%]", mine && "text-right")}>
                        {!mine ? (
                          <div className="mb-1 text-xs text-muted-foreground">
                            {activeContactName}
                          </div>
                        ) : null}

                        <div
                          className={cn(
                            "inline-block rounded-2xl px-4 py-2 text-sm shadow-xs",
                            mine
                              ? "bg-[#d9fdd3] text-foreground dark:bg-primary dark:text-primary-foreground"
                              : "bg-background text-foreground ring-1 ring-border/40",
                          )}
                        >
                          {m.content}
                        </div>
                        <div
                          className={cn(
                            "mt-1 flex items-center gap-1 text-[11px] text-muted-foreground",
                            mine ? "justify-end" : "justify-start",
                          )}
                        >
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {mine ? (
                            <MessageStatusTicks
                              status={aggregateMessageStatus(m.statuses)}
                            />
                          ) : null}
                        </div>
                      </div>

                      {mine ? (
                        <Avatar className="size-8 ring-1 ring-border/60">
                          <AvatarFallback>{initials(user?.displayName || "Me")}</AvatarFallback>
                        </Avatar>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="shrink-0 border-t bg-background px-4 py-3">
              {peerTyping ? (
                <p className="mx-auto mb-1.5 max-w-3xl animate-pulse text-xs text-muted-foreground">
                  {activeContactName} is typing...
                </p>
              ) : null}
              <div className="mx-auto flex w-full max-w-3xl items-center gap-2">
                <Input
                  className="flex-1"
                  value={draft}
                  onChange={(e) => {
                    const value = e.target.value
                    setDraft(value)
                    if (value.trim()) notifyTyping()
                    else stopTyping()
                  }}
                  onBlur={stopTyping}
                  placeholder="Type a message…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      onSend()
                    }
                  }}
                />
                <Button
                  onClick={onSend}
                  size="icon"
                  disabled={!draft.trim() || !isConnected}
                  className="shrink-0"
                >
                  <Send className="size-4" />
                </Button>
              </div>
              <p className="mx-auto mt-1.5 max-w-3xl text-xs text-muted-foreground">
                Press <kbd className="rounded border px-1">Enter</kbd> to send
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export type ChatUser = {
  id: string
  name: string
  status?: "online" | "away" | "offline"
}

export type ChatMessage = {
  id: string
  conversationId: string
  author: ChatUser
  content: string
  createdAt: string
}


export const me: ChatUser = {
  id: "me",
  name: "You",
  status: "online",
}

export const users: ChatUser[] = [
  { id: "u1", name: "Priya Sharma", status: "online" },
  { id: "u2", name: "Sarah Chen", status: "away" },
  { id: "u3", name: "Marcus Johnson", status: "offline" },
  { id: "u4", name: "Alex Rivera", status: "online" },
]






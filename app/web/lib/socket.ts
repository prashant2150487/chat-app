import { SOCKET_EVENTS } from "@/constants/socketEvents";
import { SOCKET_BASE_URL } from "@/services/endPoints";
import type { MessageStatusRow } from "@/lib/message-status";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export type ChatMessagePayload = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  replyToId?: string | null;
  createdAt: string;
  statuses?: MessageStatusRow[];
};

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(accessToken: string): Socket {
  if (socket?.connected) {
    return socket;
  }
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  socket = io(SOCKET_BASE_URL, {
    path: "/socket.io",
    auth: {
      token: accessToken,
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
  })
  socket.on("connect", () => {
    console.log("[socket] connected", socket?.id);
  })
  socket.on("connect_error", (err) => {
    console.error("[socket] connect_error", err.message);
  });
  socket.on("connect_error", (err) => {
    console.error("[socket] connect_error", err.message);
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  console.log("[socket] disconnected");
}

export function joinConversation(conversationId: string) {
  // server destructures { conversationId } — must send an object, not a plain string
  socket?.emit(SOCKET_EVENTS.CONVERSATION_JOIN, { conversationId });
}

export function leaveConversation(conversationId: string) {
  socket?.emit(SOCKET_EVENTS.CONVERSATION_LEAVE, { conversationId });
}

export function sendChatMessage(payload:
  {
    conversationId: string;
    content: string;
    type: string;
    replyToId?: string | null;
  }) {
  socket?.emit(SOCKET_EVENTS.MESSAGE_SEND, payload);
}

export function markMessageRead(conversationId: string, messageId: string) {
  socket?.emit(SOCKET_EVENTS.MESSAGE_READ, { conversationId, messageId });
}
export function emitTypingStart(conversationId: string) {
  socket?.emit(SOCKET_EVENTS.TYPING_START, { conversationId });
}
export function emitTypingStop(conversationId: string) {
  socket?.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId });
}
export { SOCKET_EVENTS }


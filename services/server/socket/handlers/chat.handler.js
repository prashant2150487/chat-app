import { randomUUID } from "crypto";
import { SOCKET_EVENTS } from "../../constants/socketEvents.js";
import {
  conversationRoom,
  joinConversationRoom,
  leaveConversationRoom,
} from "../rooms/room.manager.js";
import { prisma } from "../../config/database.js";

export const registerChatHandlers = (io, socket) => {
  const userId = socket.data.user.id;

  socket.on(SOCKET_EVENTS.CONVERSATION_JOIN, ({ conversationId }) => {
    if (!conversationId) {
      socket.emit("error", { message: "conversationId is required" });
      return;
    }

    // TODO: verify user is a participant via conversation_participants
    joinConversationRoom(socket, conversationId);
    console.log(`User ${userId} joined conversation ${conversationId}`);
  });

  socket.on(SOCKET_EVENTS.CONVERSATION_LEAVE, ({ conversationId }) => {
    if (!conversationId) return;
    leaveConversationRoom(socket, conversationId);
  });

  socket.on(
    SOCKET_EVENTS.MESSAGE_SEND,
    async ({ conversationId, content, type = "text", replyToId }) => {
      if (!conversationId || !content?.trim()) {
        socket.emit("error", { message: "conversationId and content required" });
        return;
      }
      // save to db
      const message = await prisma.message.create({
        data: {
          id: randomUUID(),
          conversationId,
          senderId: userId,
          content: content.trim(),
          type,
          replyToId: replyToId ?? null,
          createdAt: new Date().toISOString(),
        }
      })

      io.to(conversationRoom(conversationId)).emit(
        SOCKET_EVENTS.MESSAGE_RECEIVE,
        message,
      );
    },
  );

  socket.on(SOCKET_EVENTS.TYPING_START, ({ conversationId }) => {
    if (!conversationId) return;
    socket.to(conversationRoom(conversationId)).emit(SOCKET_EVENTS.TYPING_START, {
      conversationId,
      userId,
    });
  });

  socket.on(SOCKET_EVENTS.TYPING_STOP, ({ conversationId }) => {
    if (!conversationId) return;
    socket.to(conversationRoom(conversationId)).emit(SOCKET_EVENTS.TYPING_STOP, {
      conversationId,
      userId,
    });
  });

  socket.on(
    SOCKET_EVENTS.MESSAGE_READ,
    ({ conversationId, messageId }) => {
      if (!conversationId || !messageId) return;
      io.to(conversationRoom(conversationId)).emit(SOCKET_EVENTS.MESSAGE_READ, {
        conversationId,
        messageId,
        userId,
        readAt: new Date().toISOString(),
      });
    },
  );
};

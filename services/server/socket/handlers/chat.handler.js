import { SOCKET_EVENTS } from "../../constants/socketEvents.js";
import { MESSAGE_STATUS, messageService } from "../../services/messageService.js";
import {
  conversationRoom,
  joinConversationRoom,
  leaveConversationRoom,
} from "../rooms/room.manager.js";

export const registerChatHandlers = (io, socket) => {
  const userId = socket.data.user.id;

  socket.on(SOCKET_EVENTS.CONVERSATION_JOIN, async ({ conversationId }) => {
    if (!conversationId) {
      socket.emit("error", { message: "conversationId is required" });
      return;
    }

    try {
      await messageService.assertParticipant(conversationId, userId);
      joinConversationRoom(socket, conversationId);
      console.log(`User ${userId} joined conversation ${conversationId}`);
    } catch (err) {
      socket.emit("error", {
        message: err.message || "Failed to join conversation",
      });
    }
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

      try {
        const { message, statuses } = await messageService.createMessage({
          conversationId,
          senderId: userId,
          content,
          type,
          replyToId,
          io,
        });

        io.to(conversationRoom(conversationId)).emit(
          SOCKET_EVENTS.MESSAGE_RECEIVE,
          { ...message, statuses },
        );

        for (const row of statuses) {
          if (row.status === MESSAGE_STATUS.DELIVERED) {
            io.to(conversationRoom(conversationId)).emit(
              SOCKET_EVENTS.MESSAGE_DELIVERED,
              {
                conversationId,
                messageId: row.messageId,
                userId: row.userId,
                status: row.status,
                updatedAt: row.updatedAt,
              },
            );
          }
        }
      } catch (err) {
        socket.emit("error", {
          message: err.message || "Failed to send message",
        });
      }
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
    async ({ conversationId, messageId }) => {
      if (!conversationId || !messageId) return;

      try {
        const payload = await messageService.markMessageRead({
          messageId,
          conversationId,
          userId,
        });

        io.to(conversationRoom(conversationId)).emit(
          SOCKET_EVENTS.MESSAGE_READ,
          {
            ...payload,
            readAt: payload.readAt.toISOString(),
          },
        );
      } catch (err) {
        socket.emit("error", {
          message: err.message || "Failed to mark message as read",
        });
      }
    },
  );
};

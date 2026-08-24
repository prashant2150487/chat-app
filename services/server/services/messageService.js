import { randomUUID } from "crypto";
import { prisma } from "../config/database.js";
import { AppError } from "../utils/appError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { conversationRoom } from "../socket/rooms/room.manager.js";

export const MESSAGE_STATUS = {
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read",
};

async function loadConversationForMember(conversationId, userId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { participants: true },
  });

  if (!conversation) {
    throw new AppError("Conversation not found", HTTP_STATUS.NOT_FOUND);
  }

  const isMember = conversation.participants.some((p) => p.userId === userId);
  if (!isMember) {
    throw new AppError(
      "You are not a participant of this conversation",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  return conversation;
}

async function getUserIdsInConversationRoom(io, conversationId) {
  if (!io) return new Set();

  const sockets = await io.in(conversationRoom(conversationId)).fetchSockets();
  return new Set(
    sockets
      .map((s) => s.data?.user?.id)
      .filter((id) => typeof id === "string"),
  );
}

export const messageService = {
  assertParticipant: loadConversationForMember,

  getMessageHistory: async (conversationId, userId) => {
    await loadConversationForMember(conversationId, userId);

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    if (messages.length === 0) {
      return [];
    }

    const sentMessageIds = messages
      .filter((m) => m.senderId === userId)
      .map((m) => m.id);

    let statusesByMessageId = new Map();

    if (sentMessageIds.length > 0) {
      const statusRows = await prisma.messageStatus.findMany({
        where: { messageId: { in: sentMessageIds } },
      });

      statusesByMessageId = statusRows.reduce((map, row) => {
        const list = map.get(row.messageId) ?? [];
        list.push({
          userId: row.userId,
          status: row.status,
          updatedAt: row.updatedAt,
        });
        map.set(row.messageId, list);
        return map;
      }, new Map());
    }

    return messages.map((msg) => ({
      ...msg,
      statuses:
        msg.senderId === userId
          ? statusesByMessageId.get(msg.id) ?? []
          : [],
    }));
  },

  createMessage: async ({
    conversationId,
    senderId,
    content,
    type = "text",
    replyToId = null,
    io = null,
  }) => {
    const conversation = await loadConversationForMember(
      conversationId,
      senderId,
    );

    const recipients = conversation.participants
      .map((p) => p.userId)
      .filter((id) => id !== senderId);

    const usersInRoom = await getUserIdsInConversationRoom(io, conversationId);

    const messageId = randomUUID();
    const createdAt = new Date();

    const { message, statuses } = await prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          id: messageId,
          conversationId,
          senderId,
          content: content.trim(),
          type,
          replyToId: replyToId ?? null,
          createdAt,
        },
      });

      const statusRows = [];
      for (const recipientId of recipients) {
        const inRoom = usersInRoom.has(recipientId);
        const status = inRoom
          ? MESSAGE_STATUS.DELIVERED
          : MESSAGE_STATUS.SENT;

        const row = await tx.messageStatus.create({
          data: {
            messageId: created.id,
            userId: recipientId,
            status,
          },
        });
        statusRows.push(row);
      }

      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: created.createdAt },
      });

      return { message: created, statuses: statusRows };
    });

    return { message, statuses };
  },

  markMessageRead: async ({ messageId, conversationId, userId }) => {
    await loadConversationForMember(conversationId, userId);

    const message = await prisma.message.findFirst({
      where: { id: messageId, conversationId },
    });

    if (!message) {
      throw new AppError("Message not found", HTTP_STATUS.NOT_FOUND);
    }

    if (message.senderId === userId) {
      throw new AppError("Cannot mark your own message as read", HTTP_STATUS.BAD_REQUEST);
    }

    const [status] = await prisma.$transaction([
      prisma.messageStatus.upsert({
        where: {
          messageId_userId: { messageId, userId },
        },
        create: {
          messageId,
          userId,
          status: MESSAGE_STATUS.READ,
        },
        update: {
          status: MESSAGE_STATUS.READ,
        },
      }),
      prisma.conversationParticipant.update({
        where: {
          conversationId_userId: { conversationId, userId },
        },
        data: { lastReadAt: new Date() },
      }),
    ]);

    return {
      messageId,
      conversationId,
      userId,
      status: status.status,
      readAt: status.updatedAt,
    };
  },
};

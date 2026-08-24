import { messageService, MESSAGE_STATUS } from "../services/messageService.js";
import { prisma } from "../config/database.js";

const conv = await prisma.conversation.findFirst({
  include: { participants: true },
});

if (!conv || conv.participants.length < 2) {
  console.log("SKIP: need a conversation with 2+ participants in DB");
  process.exit(0);
}

const sender = conv.participants[0].userId;
const recipient = conv.participants.find((p) => p.userId !== sender);

const { message, statuses } = await messageService.createMessage({
  conversationId: conv.id,
  senderId: sender,
  content: `status smoke test ${Date.now()}`,
});

console.log("message id:", message.id);
console.log(
  "statuses:",
  statuses.map((s) => ({ userId: s.userId, status: s.status })),
);

const readPayload = await messageService.markMessageRead({
  messageId: message.id,
  conversationId: conv.id,
  userId: recipient.userId,
});

console.log("read:", readPayload.status === MESSAGE_STATUS.READ ? "OK" : "FAIL");

await prisma.$disconnect();

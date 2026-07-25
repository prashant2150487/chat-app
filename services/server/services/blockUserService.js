import { prisma } from "../config/database.js";
import { AppError } from "../utils/appError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { ERROR_MESSAGES } from "../constants/errorMessage.js";

const blockedSelect = {
  blockerId: true,
  blockedId: true,
  createdAt: true,
  blocked: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
};

export const blockUserService = {
  getBlockedUsers: async (blockerId) => {
    if (!blockerId) {
      throw new AppError("User id is required", HTTP_STATUS.BAD_REQUEST);
    }

    return prisma.blockedUser.findMany({
      where: { blockerId },
      select: blockedSelect,
      orderBy: { createdAt: "desc" },
    });
  },

  blockUser: async (blockerId, blockedId) => {
    if (!blockerId || !blockedId) {
      throw new AppError("User id is required", HTTP_STATUS.BAD_REQUEST);
    }

    if (blockerId === blockedId) {
      throw new AppError(ERROR_MESSAGES.CANNOT_BLOCK_SELF, HTTP_STATUS.BAD_REQUEST);
    }

    const target = await prisma.user.findUnique({ where: { id: blockedId } });
    if (!target) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const existing = await prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: { blockerId, blockedId },
      },
    });
    if (existing) {
      throw new AppError("User already blocked", HTTP_STATUS.CONFLICT);
    }

    return prisma.blockedUser.create({
      data: { blockerId, blockedId },
      select: blockedSelect,
    });
  },

  unblockUser: async (blockerId, blockedId) => {
    if (!blockerId || !blockedId) {
      throw new AppError("User id is required", HTTP_STATUS.BAD_REQUEST);
    }

    const existing = await prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: { blockerId, blockedId },
      },
    });
    if (!existing) {
      throw new AppError("Blocked user not found", HTTP_STATUS.NOT_FOUND);
    }

    return prisma.blockedUser.delete({
      where: {
        blockerId_blockedId: { blockerId, blockedId },
      },
      select: blockedSelect,
    });
  },
};

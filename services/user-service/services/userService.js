import { AppError } from "../utils/appError.js";
import { ERROR_MESSAGES } from "../constants/errorMessage.js";
import { prisma } from "../config/database.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

const profileSelect = {
  id: true,
  username: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
  phone: true,
  isOnline: true,
  lastSeenAt: true,
  statusMsg: true,
  privacy: true,
  createdAt: true,
};

export const userService = {
  /**
   * Create public profile with the SAME id as auth-user.id
   */
  createProfile: async ({ id, username, displayName, phone }) => {
    if (!id) {
      throw new AppError("User id is required", HTTP_STATUS.BAD_REQUEST);
    }
    if (!username) {
      throw new AppError("Username is required", HTTP_STATUS.BAD_REQUEST);
    }
    if (!displayName) {
      throw new AppError("Display name is required", HTTP_STATUS.BAD_REQUEST);
    }

    const existingById = await prisma.user.findUnique({ where: { id } });
    if (existingById) {
      return existingById;
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      throw new AppError(
        ERROR_MESSAGES.USERNAME_ALREADY_EXISTS,
        HTTP_STATUS.CONFLICT,
      );
    }

    return prisma.user.create({
      data: {
        id, // must match auth-user.id
        username,
        displayName,
        phone: phone || null,
      },
      select: profileSelect,
    });
  },

  userDetails: async (userId) => {
    if (!userId) {
      throw new AppError("UserId is required", HTTP_STATUS.BAD_REQUEST);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: profileSelect,
    });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return user;
  },

  getUserById: async (userId) => {
    return userService.userDetails(userId);
  },

  listUsers: async () => {
    return prisma.user.findMany({
      select: profileSelect,
      orderBy: { createdAt: "desc" },
    });
  },
};

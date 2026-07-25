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
  updateProfile: async ({ id, displayName, bio, statusMsg, avatarUrl, phone, privacy }) => {
    if (!id) {
      throw new AppError("User id is required", HTTP_STATUS.BAD_REQUEST);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const data = {};
    if (displayName !== undefined) {
      if (!displayName?.trim()) {
        throw new AppError("Display name is required", HTTP_STATUS.BAD_REQUEST);
      }
      data.displayName = displayName.trim();
    }
    if (bio !== undefined) data.bio = bio?.trim() || null;
    if (statusMsg !== undefined) data.statusMsg = statusMsg?.trim() || null;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl?.trim() || null;
    if (phone !== undefined) data.phone = phone?.trim() || null;
    if (privacy !== undefined) {
      const allowedLastSeen = ["everyone", "contacts", "nobody"];
      const allowedProfilePhoto = ["everyone", "contacts", "nobody"];

      if (
        typeof privacy !== "object" ||
        privacy === null ||
        !allowedLastSeen.includes(privacy.last_seen) ||
        !allowedProfilePhoto.includes(privacy.profile_photo)
      ) {
        throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, HTTP_STATUS.BAD_REQUEST);
      }

      data.privacy = privacy;
    }

    return prisma.user.update({
      where: { id },
      data,
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
  getUserById: async (id) => {
    if (!id) {
      throw new AppError("User id is required", HTTP_STATUS.BAD_REQUEST);
    }
    const user = await prisma.user.findUnique({
      where: { id },
      select: profileSelect,
    });
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return user;
  },

  getUserByUserName: async (username) => {
    if (!username) {
      throw new AppError("Username is required", HTTP_STATUS.BAD_REQUEST);
    }
    const user = await prisma.user.findUnique({
      where: { username },
      select: profileSelect,
    });
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return user;
  },
};


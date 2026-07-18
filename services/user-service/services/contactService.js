import { prisma } from "../config/database.js";
import { AppError } from "../utils/appError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { ERROR_MESSAGES } from "../constants/errorMessage.js";
import { getContacts } from "../controllers/contactController.js";

const contactSelect = {
  id: true,
  ownerId: true,
  contactId: true,
  nickname: true,
  createdAt: true,
  contact: {
    select: {
      id: true,
      username: true,
      displayName: true,
      phone: true,
      avatarUrl: true,
    },
  },
};

const assertCanAddContact = async (ownerId, contactId) => {
  if (ownerId === contactId) {
    throw new AppError(ERROR_MESSAGES.CANNOT_ADD_SELF, HTTP_STATUS.BAD_REQUEST);
  }

  const existing = await prisma.contact.findUnique({
    where: {
      ownerId_contactId: { ownerId, contactId },
    },
  });

  if (existing) {
    throw new AppError(
      ERROR_MESSAGES.CONTACT_ALREADY_EXISTS,
      HTTP_STATUS.CONFLICT,
    );
  }
};

export const contactService = {
  getContacts: async (ownerId) =>{
    return prisma.contact.findMany({
      where: {ownerId},
      select: contactSelect
    })
  },
  createContactByPhone: async (phone, ownerId, nickname) => {
    if (!phone) {
      throw new AppError("Phone is required", HTTP_STATUS.BAD_REQUEST);
    }
    if (!ownerId) {
      throw new AppError("Owner id is required", HTTP_STATUS.BAD_REQUEST);
    }

    const target = await prisma.user.findFirst({ where: { phone } });
    if (!target) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    await assertCanAddContact(ownerId, target.id);

    return prisma.contact.create({
      data: {
        ownerId,
        contactId: target.id,
        nickname: nickname || null,
      },
      select: contactSelect,
    });
  },

  createContactByUserName: async (username, ownerId, nickname) => {
    if (!username) {
      throw new AppError("Username is required", HTTP_STATUS.BAD_REQUEST);
    }
    if (!ownerId) {
      throw new AppError("Owner id is required", HTTP_STATUS.BAD_REQUEST);
    }

    const target = await prisma.user.findUnique({ where: { username } });
    if (!target) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    await assertCanAddContact(ownerId, target.id);

    return prisma.contact.create({
      data: {
        ownerId,
        contactId: target.id,
        nickname: nickname || null,
      },
      select: contactSelect,
    });
  },
};

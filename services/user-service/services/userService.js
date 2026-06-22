import { AppError } from "../utils/appError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { ERROR_MESSAGES } from "../constants/errorMessage.js";

// Demo data so the endpoint works without a provisioned database.
// Replace with prisma queries (see config/database.js) for real features.
const DEMO_USER = {
    id: "00000000-0000-0000-0000-000000000001",
    username: "demo_user",
    displayName: "Demo User",
    bio: "This is a demo profile returned by the service layer.",
    avatarUrl: null,
    isOnline: true,
    statusMsg: "Available",
    privacy: { last_seen: "contacts", profile_photo: "everyone" },
    createdAt: new Date().toISOString(),
};

export const getDemoUserService = async (userId) => {
    if (!userId) {
        throw new AppError(
            ERROR_MESSAGES.VALIDATION_FAILED,
            HTTP_STATUS.BAD_REQUEST,
        );
    }

    // Real implementation would be:
    // const user = await prisma.user.findUnique({ where: { id: userId } });
    // if (!user) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    return { ...DEMO_USER, id: userId };
};

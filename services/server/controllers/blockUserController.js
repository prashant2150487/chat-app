import { HTTP_STATUS } from "../constants/httpStatus.js";
import { blockUserService } from "../services/blockUserService.js";

export const blockedUsers = async (req, res, next) => {
  try {
    const blockerId = req.user.id;
    const users = await blockUserService.getBlockedUsers(blockerId);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: users,
      message: "Blocked users fetched successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const blockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const blockerId = req.user.id;
    const blockedUser = await blockUserService.blockUser(blockerId, userId);

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: blockedUser,
      message: "User blocked successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const unblockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const blockerId = req.user.id;
    const unblockedUser = await blockUserService.unblockUser(blockerId, userId);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: unblockedUser,
      message: "User unblocked successfully",
    });
  } catch (err) {
    next(err);
  }
};

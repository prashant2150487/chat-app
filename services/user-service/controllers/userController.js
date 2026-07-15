import { HTTP_STATUS } from "../constants/httpStatus.js";
import { userService } from "../services/userService.js";

export const createProfile = async (req, res, next) => {
  try {
    const { id, username, displayName, phone } = req.body;
    const user = await userService.createProfile({
      id,
      username,
      displayName,
      phone,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await userService.userDetails(id);
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
export const updateMe = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { displayName, bio, statusMsg, avatarUrl } = req.body;
    const user = await userService.updateProfile({ id, displayName, bio, statusMsg, avatarUrl });
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user
    })


  } catch (err) {
    next(err)
  }
};
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
export const getUserByUserName = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await userService.getUserByUserName(username);
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};


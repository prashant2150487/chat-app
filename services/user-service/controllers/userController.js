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
export const updateMe = async ( rew ,res, next) => {
  try{
    const { id} = res.user;
    

  }catch(err){
    next(err)
  }

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.listUsers();
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

import { asyncHandler } from "../utils/asyncHandler.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { getAllUsersService } from "../services/userService.js";



// fetch all users
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await getAllUsersService()
        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: users,
        })

    } catch (err) {
        console.error("errr", err);
        next(err)
    }
}
// fetch public details
export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await getUserById(id)
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            data: user,
        })

    } catch (err) {
        console.error("errr", err);
        next(err)

    }
}




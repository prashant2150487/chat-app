import { asyncHandler } from "../utils/asyncHandler.js";
import { getDemoUserService } from "../services/userService.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const getDemoUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await getDemoUserService(id);

    return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: user,
    });
});

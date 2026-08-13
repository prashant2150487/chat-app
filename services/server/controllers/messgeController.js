import { HTTP_STATUS } from "../constants/httpStatus.js";
import { messageService } from "../services/messageService.js";
import { AppError } from "../utils/appError.js";





export const getMessageHistory = async (req, res, next) => {
    try {
        const { id: conversationId } = req.params;  
        const { id: userId } = req.user;
        
        if (!userId) {
            throw new AppError("Please provide user id", HTTP_STATUS.BAD_REQUEST)
        }
        const message = await messageService.getMessageHistory(conversationId, userId)
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            data: message,
            message: "Messages history fetched successfully"
        })

    }catch(err){
        next(err)
    }
}
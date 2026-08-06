import { HTTP_STATUS } from "../constants/httpStatus.js";
import { conversationService } from "../services/conversationService.js";
import { AppError } from "../utils/appError.js";






export const getAllConversation = async (req, res, next) => {
    try {
        const { id } = req.user;
        const data = await conversationService.getAllConversationsForUser(id);
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            data,
            message: "Conversations listed successfully",
        });
    } catch (err) {
        next(err)
    }
}
export const getConversationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id: userId } = req.user;
        if (!id) {
            throw new AppError("Please provide conversation id")
        }
        if (!userId) {
            throw new AppError("Please provide user id")
        }
        const { conversation } = await conversationService.getConversationById(id, userId);
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            data: conversation,
            message: "Conversation fetched successfully",
        });
    } catch (err) {
        next(err)
    }
}

export const createConversation = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { peerUserId } = req.body;
        if (!peerUserId) {
            throw new AppError("Please provide peer user id", HTTP_STATUS.BAD_REQUEST)
        }
        if (!userId) {
            throw new AppError("Please provide user id", HTTP_STATUS.BAD_REQUEST)
        }
        const conversation = await conversationService.createConversation(userId, peerUserId);
        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: conversation,
            message: "Conversation created successfully",
        });
    } catch (err) {
        next(err)
    }
}


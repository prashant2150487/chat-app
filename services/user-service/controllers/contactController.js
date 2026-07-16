import { HTTP_STATUS } from "../constants/httpStatus.js";
import { contactService } from "../services/contactService.js";
import { AppError } from "../utils/appError.js";





export const createContactByPhone = async (req, res, next) => {
    try {
        const { phone } = req.body;
        const { userId } = req.user;
        if (!phone) {
            throw new AppError("Phone is required", HTTP_STATUS.BAD_REQUEST)
        }
        const newContact = await contactService.createContactByPhone(phone, userId)
        return res.status(HTTP_STATUS.CREATED).json({
            sucess: true,
            data: newContact
        })
    } catch (err) {
        next(err)
    }
}
export const createContactByUserName = async (req, res, next) => {
    try {
        const { username } = req.body;
        const { userId } = req.user;
        if (!username) {
            throw new AppError("Username is required", HTTP_STATUS.BAD_REQUEST)
        }
        const newContact = await contactService.createContactByUserName(username, userId)
        return res.status(HTTP_STATUS.CREATED).json({
            sucess: true,
            data: newContact
        })
    } catch (err) {
        next(err)
    }
}   
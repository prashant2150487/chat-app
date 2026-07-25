import { HTTP_STATUS } from "../constants/httpStatus.js";
import { contactService } from "../services/contactService.js";
import { AppError } from "../utils/appError.js";



export const getContacts = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const contacts = await contactService.getContacts(ownerId)
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: contacts,
      message: "Contacts fetched successfully",
    })

  } catch (err) {
    next(err)
  }
}

export const createContactByPhone = async (req, res, next) => {
  try {
    const { phone, nickname } = req.body;
    const ownerId = req.user.id;

    if (!phone) {
      throw new AppError("Phone is required", HTTP_STATUS.BAD_REQUEST);
    }

    const newContact = await contactService.createContactByPhone(
      phone,
      ownerId,
      nickname,
    );
    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: newContact,
      message: "Contact created successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const createContactByUserName = async (req, res, next) => {
  try {
    const { username, nickname } = req.body;
    const ownerId = req.user.id;

    if (!username) {
      throw new AppError("Username is required", HTTP_STATUS.BAD_REQUEST);
    }

    const newContact = await contactService.createContactByUserName(
      username,
      ownerId,
      nickname,
    );
    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: newContact,
      message: "Contact created successfully",
    });
  } catch (err) {
    next(err);
  }
};


export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const OwnerId = req.user.id;
    const contct = await contactService.deleteContact(id, OwnerId);
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: contct,
      message: "Contact deleted successfully",
    })
  } catch (err) {
    next(err)
  }
}


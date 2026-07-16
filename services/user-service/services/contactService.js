import { prisma } from "../config/database.js";
import { AppError } from "../utils/appError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";




export const contactService = {
    createContactByPhone: async (phone, userId)=>{
        const conatct = await prisma.contact.findUnique({
            where:{
                phone: phone
            }
        })
        if(conatct){
            throw new AppError("Contact already exists", HTTP_STATUS.BAD_REQUEST)
        }
        const newContact = await prisma.contact.create({
            data:{
                phone: phone,
                userId: userId
            },
            select:{
                id: true,
                phone: true,
                userId: true
            }
        })
        return newContact;
    },
    createContactByUserName: async (username, userId)=>{
        const contact = await prisma.contact.findUnique({
            where:{
                username: username
            }
        })
        if(contact){
            throw new AppError("Contact already exists", HTTP_STATUS.BAD_REQUEST)
        }
        const newContact = await prisma.contact.create({
            data:{
                username: username,
                userId: userId
            },
            select:{
                id: true,
                username: true,
                userId: true
            }
        })
        return newContact;
    }
}   
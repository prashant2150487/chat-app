import { AppError } from "../utils/appError.js";
import { ERROR_MESSAGES } from "../constants/errorMessage.js";
import { prisma } from "../config/database.js";





export const getAllUsersService = async()=>{
    const users= await prisma.user.findMany();
    return users;
}


export const getUserById= async (userId)=>{
    if(!userId){
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND)
    }
    const user = await prisma.user.findUnique({
        where:{
            id: userId,

        }
    })
    if(!user){
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        
    }
    return user;
}

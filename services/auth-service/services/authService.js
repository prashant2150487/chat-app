import { comparePassword, hashPassword } from "../utils/password.js";
import { prisma } from "../config/database.js";
import { AppError } from "../utils/appError.js";
import { sendEmail } from "./emailService.js";
import { ERROR_MESSAGES } from "../constants/errorMessage.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { generateOTP } from "../utils/helper.js";
import { otpTemplate } from "../template/otpTemplate.js";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async (userPayload) => {
    const { email, password, firstName, lastName, mobile } = userPayload;

    if (!email) {
        throw new AppError("Email is required", 400)
    }
    if (!password) {
        throw new AppError("Password is required", 400)
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if (existingUser) {
        throw new AppError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT)
    }

    const hashedPassword = await hashPassword(userPayload.password);



    const user = await prisma.user.create({
        data: {
            email: userPayload.email,
            password: hashedPassword,
            lastName: userPayload.lastName,
            firstName: userPayload.firstName,
            mobile: userPayload.mobile,
            role: userPayload.role,

        }
    })

    const otp = generateOTP();

    if (user) {

        const otpData = await prisma.otp.create({
            data: {
                email: user.email,
                otp: String(otp),
                verified: false,
                userId: user.id,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            }
        })
        if (otpData) {
            await sendEmail(user.email, "verify otp", await otpTemplate(otp))

        }
    }

    return {
        user,
    }
}

export const verifyOtpService = async (email, otp) => {
    const otpRecord = await prisma.otp.findFirst({
        where: {
            email: email
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    if (!otpRecord) {
        throw new AppError("OTP not found", 404)
    }
    if (otpRecord.otp !== otp) {
        throw new AppError("Incorrect OTP", 400)
    }
    if (otpRecord.expiresAt < new Date()) {
        throw new AppError("OTP expired", 400)
    }
    if (otpRecord.verified) {
        throw new Error("Otp already verified")
    }

    await prisma.otp.update({
        where: {
            id: otpRecord.id

        },
        data: {
            verified: true,

        }
    })
    await prisma.user.update({
        where: {
            id: otpRecord.userId
        },
        data: {
            is_email_verified: true,
        }
    })


    const user = await prisma.user.findUnique({
        where: {
            id: otpRecord.userId
        }
    })

    await prisma.otp.delete({ where: { id: otpRecord.id } });
    return { user }
}

export const loginService = async (email, password) => {
    if (!email || !password) {
        throw new AppError("Email and password are required", 400)
    }
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if (!user) {
        throw new AppError("User not found", 404)
    }
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
        throw new AppError("Invalid password", 400)
    }
    const token = generateToken({email:user.email, id:user.id, role:user.role});
    await prisma.user.update({
        where: {
            id: user.id,

        },
        data: {
            token: token
        }

    })





    return { user, token }
}
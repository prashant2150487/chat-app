import { comparePassword, hashPassword } from "../utils/password.js";
import { prisma } from "../config/database.js";
import { AppError } from "../utils/appError.js";
import { sendEmail } from "./emailService.js";
import { ERROR_MESSAGES } from "../constants/errorMessage.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { generateOTP } from "../utils/helper.js";
import { otpTemplate } from "../template/otpTemplate.js";
import { generateToken, generateRefreshToken } from "../utils/jwt.js";
import { createUserProfile } from "./userProfileClient.js";

const toPublicAuthUser = (user) => {
  if (!user) return null;
  const { password, token, refreshToken, ...safe } = user;
  return safe;
};

export const registerUser = async (userPayload) => {
  const { email, password, firstName, lastName, mobile, role } = userPayload;

  if (!email) {
    throw new AppError("Email is required", 400);
  }
  if (!password) {
    throw new AppError("Password is required", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new AppError(
      ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      HTTP_STATUS.CONFLICT,
    );
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: firstName || null,
      lastName: lastName || null,
      mobile: mobile || null,
      role: role || "USER",
    },
  });

  try {
    // users.id === auth-user.id
    await createUserProfile({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mobile: user.mobile,
    });
  } catch (err) {
    // Compensating rollback so auth-user and users stay in sync
    await prisma.otp.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    throw err;
  }

  const otp = generateOTP();

  const otpData = await prisma.otp.create({
    data: {
      email: user.email,
      otp: String(otp),
      verified: false,
      userId: user.id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  if (otpData) {
    await sendEmail(user.email, "verify otp", await otpTemplate(otp));
  }

  return {
    user: toPublicAuthUser(user),
  };
};

export const verifyOtpService = async (email, otp) => {
  const otpRecord = await prisma.otp.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });
  if (!otpRecord) {
    throw new AppError("OTP not found", 404);
  }
  if (otpRecord.otp !== otp) {
    throw new AppError("Incorrect OTP", 400);
  }
  if (otpRecord.expiresAt < new Date()) {
    throw new AppError("OTP expired", 400);
  }
  if (otpRecord.verified) {
    throw new Error("Otp already verified");
  }

  await prisma.otp.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  await prisma.user.update({
    where: { id: otpRecord.userId },
    data: { is_email_verified: true },
  });

  const user = await prisma.user.findUnique({
    where: { id: otpRecord.userId },
  });

  await prisma.otp.delete({ where: { id: otpRecord.id } });
  return { user: toPublicAuthUser(user) };
};

export const loginService = async (email, password) => {
  if (!email || !password) {
    throw new AppError(
      "Email and password are required",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid password", HTTP_STATUS.UNAUTHORIZED);
  }
  const tokenPayload = { email: user.email, id: user.id, role: user.role };
  const token = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      token,
      refreshToken,
    },
  });
  return { user: toPublicAuthUser(user), token, refreshToken };
};

export const getMeService = async (userId) => {
  if (!userId) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  return toPublicAuthUser(user);
};

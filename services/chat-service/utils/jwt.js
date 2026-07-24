import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const verifyAccessToken = (token) => {
  const secret = ENV.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured in chat-service");
  }

  return jwt.verify(token, secret);
};

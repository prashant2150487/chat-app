import jwt from "jsonwebtoken";

export const verifyAccessToken = (token) => {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured in user-service");
  }

  return jwt.verify(token, secret);
};




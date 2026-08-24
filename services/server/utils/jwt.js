import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import { ENV } from "../config/env.js";



// / Access token - short lived (15 minutes)
export const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: ENV.JWT_EXPIRES_IN || "1d"
    }
  );
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: ENV.JWT_REFRESH_EXPIRES_IN || "7d",
    },
  )
}


export const verifyToken = (token) => {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET);
};

export const verifyAccessToken = verifyToken;

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET);
};


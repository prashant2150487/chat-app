import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../../utils/jwt.js";

const extractToken = (socket) => {
  const authToken = socket.handshake.auth?.token;
  if (authToken) return authToken;

  const header = socket.handshake.headers?.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }

  return null;
};

export const socketAuthMiddleware = (socket, next) => {
  try {
    const token = extractToken(socket);

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = verifyAccessToken(token);

    socket.data.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new Error("Token expired"));
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new Error("Invalid token"));
    }
    next(new Error("Unauthorized"));
  }
};

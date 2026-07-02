import jwt from "jsonwebtoken";

import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/appError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { ERROR_MESSAGES } from "../constants/errorMessage.js";

const extractToken = (req) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.split(" ")[1];
    }

    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }

    return null;
};

export const authenticate = (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
        }

        const decoded = verifyToken(token);

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return next(new AppError(ERROR_MESSAGES.TOKEN_EXPIRED, HTTP_STATUS.UNAUTHORIZED));
        }
        if (err instanceof jwt.JsonWebTokenError) {
            return next(new AppError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED));
        }
        next(err);
    }
};

export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
        }

        next();
    };
};

import { AppError } from "../utils/appError.js";
import { ERROR_MESSAGES } from "../constants/errorMessage.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

/**
 * Only allow calls from sibling services (auth-service → user-service).
 * Header: x-internal-secret
 */
export const requireInternalSecret = (req, res, next) => {
  const secret = req.headers["x-internal-secret"];
  const expected = process.env.INTERNAL_SERVICE_SECRET;

  if (!expected || !secret || secret !== expected) {
    return next(
      new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED),
    );
  }

  next();
};

import { ENV } from "../config/env.js";
import { AppError } from "../utils/appError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

/**
 * Build a unique username from email + auth user id suffix.
 */
export const buildUsername = (email, userId) => {
  const local = String(email || "user")
    .split("@")[0]
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 40);

  const base = local || "user";
  const suffix = String(userId).replace(/-/g, "").slice(0, 8);
  return `${base}_${suffix}`.slice(0, 50);
};

export const buildDisplayName = (firstName, lastName, username) => {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || username;
};

/**
 * Create matching row in user-service.users with the same id as auth-user.
 */
export const createUserProfile = async ({
  id,
  email,
  firstName,
  lastName,
  mobile,
}) => {
  const baseUrl = ENV.USER_SERVICE_URL;
  const secret = ENV.INTERNAL_SERVICE_SECRET;

  if (!baseUrl) {
    throw new AppError(
      "USER_SERVICE_URL is not configured",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
  if (!secret) {
    throw new AppError(
      "INTERNAL_SERVICE_SECRET is not configured",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  const username = buildUsername(email, id);
  const displayName = buildDisplayName(firstName, lastName, username);

  const response = await fetch(`${baseUrl}/api/v1/internal/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": secret,
    },
    body: JSON.stringify({
      id,
      username,
      displayName,
      phone: mobile || null,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new AppError(
      payload.message || "Failed to create user profile",
      response.status >= 400 && response.status < 600
        ? response.status
        : HTTP_STATUS.BAD_GATEWAY,
    );
  }

  return payload.data;
};

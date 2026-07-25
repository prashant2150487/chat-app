import { AppError } from "../utils/appError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { userService } from "./userService.js";

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

/** Create public profile row in `users` with the same id as `auth-user`. */
export const createUserProfile = async ({
  id,
  email,
  firstName,
  lastName,
  mobile,
}) => {
  const username = buildUsername(email, id);
  const displayName = buildDisplayName(firstName, lastName, username);

  return userService.createProfile({
    id,
    username,
    displayName,
    phone: mobile || null,
  });
};

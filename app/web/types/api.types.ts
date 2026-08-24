export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  firstName?: string
  lastName?: string
  mobile?: string
}

export interface User {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  mobile?: string | null
  role: string
  is_email_verified?: boolean
  is_phone_verified?: boolean
}

export type PrivacySetting = "everyone" | "contacts" | "nobody"

export interface UserPrivacy {
  last_seen: PrivacySetting
  profile_photo: PrivacySetting
}

/** Public profile from user-service GET /api/v1/users/me */
export interface UserProfile {
  id: string
  username: string
  displayName: string
  bio?: string | null
  avatarUrl?: string | null
  phone?: string | null
  isOnline?: boolean
  lastSeenAt?: string | null
  statusMsg?: string | null
  privacy?: UserPrivacy
  createdAt?: string
}

export interface UpdateProfilePayload {
  displayName?: string
  bio?: string | null
  statusMsg?: string | null
  avatarUrl?: string | null
  phone?: string | null
  privacy?: UserPrivacy
}

export interface ApiResponse<T> {
  success?: boolean
  message?: string
  data?: T
  token?: string
  user?: User
}

export interface LoginResponse {
  success: boolean
  message?: string
  token: string
  refreshToken?: string
  user: User
}

export interface RegisterResponse {
  success: boolean
  data: User
}

export type contact = {
   id: string,
   ownerId: string,
   contactId: string,
   nickname: string | null,
   createdAt: string,
   contact: {
    id: string,
    username: string,
    displayName: string,
    phone: string,
    avatarUrl: string | null
   }
}


export interface Conversation {
  id: string
  isGroup: boolean
  name?: string | null
  createdAt: string
  updatedAt: string
}

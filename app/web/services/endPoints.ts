// constants/apiConstants.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const SOCKET_BASE_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') ||
  'http://localhost:8000';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
  },
  CHAT: {
    CONVERSATIONS: '/conversations',
    CONVERSATION: (id: string) => `/conversations/${id}`,
    MESSAGES: (conversationId: string) => `/conversations/${conversationId}/messages`,
    SEND_MESSAGE: '/messages',
    DELETE_MESSAGE: (messageId: string) => `/messages/${messageId}`,
    EDIT_MESSAGE: (messageId: string) => `/messages/${messageId}`,
    MARK_READ: (conversationId: string) => `/conversations/${conversationId}/read`,
    CREATE_GROUP: '/conversations/group',
    UPLOAD: '/upload',
  },
  USERS: {
    ME: '/users/me',
    UPDATE_ME: '/users/me',
    SEARCH: '/users/search',
    USER_BY_ID: (userId: string) => `/users/${userId}`,
  },
  CONTACT:{
    ALL_CONTACT:"/contacts",
    ADD_BY_PHONE: "/contacts/phone"
  }
} as const;

export const API_TIMEOUTS = {
  DEFAULT: 30000,
  UPLOAD: 60000,
  LONG_POLLING: 60000,
} as const;

export const BASE = "/api/v1"
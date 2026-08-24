export const SOCKET_EVENTS = {
    CONVERSATION_JOIN: "conversation:join",
    CONVERSATION_LEAVE: "conversation:leave",
    MESSAGE_SEND: "message:send",
    MESSAGE_RECEIVE: "message:receive",
    MESSAGE_DELIVERED: "message:delivered",
    MESSAGE_READ: "message:read",
    TYPING_START: "typing:start",
    TYPING_STOP: "typing:stop",
    USER_ONLINE: "user:online",
    USER_OFFLINE: "user:offline",
  } as const;
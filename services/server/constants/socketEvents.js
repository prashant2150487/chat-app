export const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",

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

  CALL_INITIATE: "call:initiate",
  CALL_INCOMING: "call:incoming",
  CALL_ACCEPT: "call:accept",
  CALL_REJECT: "call:reject",
  CALL_END: "call:end",
  CALL_OFFER: "call:offer",
  CALL_ANSWER: "call:answer",
  CALL_ICE_CANDIDATE: "call:ice-candidate",
};

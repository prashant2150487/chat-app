import { registerConnectionHandlers } from "./connection.handler.js";
import { registerChatHandlers } from "./chat.handler.js";
// import { registerCallHandlers } from "./call.handler.js";

export const registerSocketHandlers = (io, socket) => {
  registerConnectionHandlers(io, socket);
  registerChatHandlers(io, socket);
  // registerCallHandlers(io, socket);
};

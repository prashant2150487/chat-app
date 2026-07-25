import { Server } from "socket.io";
import { socketAuthMiddleware } from "./middleware/auth.middleware.js";
import { registerSocketHandlers } from "./handlers/index.js";

const SOCKET_CORS_ORIGINS = (
  process.env.SOCKET_CORS_ORIGINS ??
  "http://localhost:3000,http://127.0.0.1:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

let ioInstance = null;

export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: SOCKET_CORS_ORIGINS,
      credentials: true,
    },
    path: "/socket.io",
  });

  ioInstance.use(socketAuthMiddleware);

  ioInstance.on("connection", (socket) => {
    registerSocketHandlers(ioInstance, socket);
  });

  console.log("Socket.IO initialized on path /socket.io");
  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.IO has not been initialized");
  }
  return ioInstance;
};

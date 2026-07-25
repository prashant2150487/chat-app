import { SOCKET_EVENTS } from "../../constants/socketEvents.js";
import { presenceService } from "../../services/presence.service.js";
import { joinUserRoom, userRoom } from "../rooms/room.manager.js";

export const registerConnectionHandlers = (io, socket) => {
  const userId = socket.data.user.id;

  joinUserRoom(socket, userId);

  const cameOnline = presenceService.addSocket(userId, socket.id);
  if (cameOnline) {
    socket.broadcast.emit(SOCKET_EVENTS.USER_ONLINE, { userId });
  }

  console.log(`Socket connected: user=${userId} socket=${socket.id}`);

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    const wentOffline = presenceService.removeSocket(userId, socket.id);
    if (wentOffline) {
      io.emit(SOCKET_EVENTS.USER_OFFLINE, { userId });
    }
    console.log(`Socket disconnected: user=${userId} socket=${socket.id}`);
  });
};

export { userRoom };

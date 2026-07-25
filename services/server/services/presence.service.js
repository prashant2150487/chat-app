/** In-memory presence tracker (Redis-ready interface). */
const onlineUsers = new Map();

export const presenceService = {
  addSocket(userId, socketId) {
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socketId);
    return onlineUsers.get(userId).size === 1;
  },

  removeSocket(userId, socketId) {
    const sockets = onlineUsers.get(userId);
    if (!sockets) return false;

    sockets.delete(socketId);
    if (sockets.size === 0) {
      onlineUsers.delete(userId);
      return true;
    }
    return false;
  },

  isOnline(userId) {
    return onlineUsers.has(userId);
  },

  getOnlineUserIds() {
    return [...onlineUsers.keys()];
  },
};

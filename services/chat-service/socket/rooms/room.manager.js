export const userRoom = (userId) => `user:${userId}`;

export const conversationRoom = (conversationId) =>
  `conversation:${conversationId}`;

export const joinUserRoom = (socket, userId) => {
  socket.join(userRoom(userId));
};

export const joinConversationRoom = (socket, conversationId) => {
  socket.join(conversationRoom(conversationId));
};

export const leaveConversationRoom = (socket, conversationId) => {
  socket.leave(conversationRoom(conversationId));
};

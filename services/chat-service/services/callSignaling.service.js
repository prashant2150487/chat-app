/** In-memory active call sessions for WebRTC signaling relay. */
const activeCalls = new Map();

export const callSignalingService = {
  createCall(callId, { callerId, calleeId, type, conversationId }) {
    const session = {
      callId,
      callerId,
      calleeId,
      type,
      conversationId: conversationId ?? null,
      status: "ringing",
      createdAt: new Date().toISOString(),
    };
    activeCalls.set(callId, session);
    return session;
  },

  getCall(callId) {
    return activeCalls.get(callId) ?? null;
  },

  updateStatus(callId, status) {
    const session = activeCalls.get(callId);
    if (!session) return null;
    session.status = status;
    activeCalls.set(callId, session);
    return session;
  },

  endCall(callId) {
    const session = activeCalls.get(callId);
    if (session) activeCalls.delete(callId);
    return session ?? null;
  },

  getPeerId(callId, userId) {
    const session = activeCalls.get(callId);
    if (!session) return null;
    if (session.callerId === userId) return session.calleeId;
    if (session.calleeId === userId) return session.callerId;
    return null;
  },
};

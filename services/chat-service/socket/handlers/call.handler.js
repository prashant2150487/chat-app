import { randomUUID } from "crypto";
import { SOCKET_EVENTS } from "../../constants/socketEvents.js";
import { callSignalingService } from "../../services/callSignaling.service.js";
import { userRoom } from "../rooms/room.manager.js";

export const registerCallHandlers = (io, socket) => {
  const userId = socket.data.user.id;

  socket.on(
    SOCKET_EVENTS.CALL_INITIATE,
    ({ toUserId, type = "voice", conversationId }) => {
      if (!toUserId) {
        socket.emit("error", { message: "toUserId is required" });
        return;
      }
      if (!["voice", "video"].includes(type)) {
        socket.emit("error", { message: "type must be voice or video" });
        return;
      }

      const callId = randomUUID();
      const session = callSignalingService.createCall(callId, {
        callerId: userId,
        calleeId: toUserId,
        type,
        conversationId,
      });

      io.to(userRoom(toUserId)).emit(SOCKET_EVENTS.CALL_INCOMING, {
        callId: session.callId,
        callerId: userId,
        type: session.type,
        conversationId: session.conversationId,
      });

      socket.emit(SOCKET_EVENTS.CALL_INITIATE, {
        callId: session.callId,
        status: "ringing",
      });
    },
  );

  socket.on(SOCKET_EVENTS.CALL_ACCEPT, ({ callId }) => {
    const session = callSignalingService.getCall(callId);
    if (!session || session.calleeId !== userId) {
      socket.emit("error", { message: "Call not found" });
      return;
    }

    callSignalingService.updateStatus(callId, "ongoing");
    io.to(userRoom(session.callerId)).emit(SOCKET_EVENTS.CALL_ACCEPT, {
      callId,
      acceptedBy: userId,
    });
  });

  socket.on(SOCKET_EVENTS.CALL_REJECT, ({ callId }) => {
    const session = callSignalingService.endCall(callId);
    if (!session) return;

    const peerId = session.callerId === userId ? session.calleeId : session.callerId;
    io.to(userRoom(peerId)).emit(SOCKET_EVENTS.CALL_REJECT, { callId, rejectedBy: userId });
  });

  socket.on(SOCKET_EVENTS.CALL_END, ({ callId }) => {
    const session = callSignalingService.getCall(callId);
    if (!session) return;

    const peerId =
      session.callerId === userId ? session.calleeId : session.callerId;

    callSignalingService.endCall(callId);

    if (peerId) {
      io.to(userRoom(peerId)).emit(SOCKET_EVENTS.CALL_END, { callId, endedBy: userId });
    }
  });

  const relayToPeer = (event) => {
    socket.on(event, ({ callId, ...payload }) => {
      const session = callSignalingService.getCall(callId);
      if (!session) {
        socket.emit("error", { message: "Call not found" });
        return;
      }

      const peerId = callSignalingService.getPeerId(callId, userId);
      if (!peerId) {
        socket.emit("error", { message: "Not a participant in this call" });
        return;
      }

      io.to(userRoom(peerId)).emit(event, { callId, fromUserId: userId, ...payload });
    });
  };

  relayToPeer(SOCKET_EVENTS.CALL_OFFER);
  relayToPeer(SOCKET_EVENTS.CALL_ANSWER);
  relayToPeer(SOCKET_EVENTS.CALL_ICE_CANDIDATE);
};

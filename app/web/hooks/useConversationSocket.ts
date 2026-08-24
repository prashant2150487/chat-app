import {
    ChatMessagePayload,
    emitTypingStart,
    emitTypingStop,
    joinConversation,
    leaveConversation,
    sendChatMessage,
    SOCKET_EVENTS,
} from "@/lib/socket";
import { useSocket } from "@/provider/socket/socketProvider";
import { useCallback, useEffect, useRef } from "react";

export type MessageStatusUpdate = {
    conversationId: string;
    messageId: string;
    userId: string;
    status: "sent" | "delivered" | "read";
    updatedAt?: string;
    readAt?: string;
};

export function useConversationSocket(
    conversationId: string | null,
    handlers: {
        onMessage?: (msg: ChatMessagePayload) => void;
        onMessageDelivered?: (data: MessageStatusUpdate) => void;
        onMessageRead?: (data: MessageStatusUpdate) => void;
        onTypingStart?: (data: { conversationId: string; userId: string }) => void;
        onTypingStop?: (data: { conversationId: string; userId: string }) => void;
    },
) {
    const { socket, isConnected } = useSocket();
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTypingRef = useRef(false);

    const handlersRef = useRef(handlers);
    useEffect(() => {
        handlersRef.current = handlers;
    });

    const notifyTyping = useCallback(() => {
        if (!conversationId || !isConnected) return;

        if (!isTypingRef.current) {
            isTypingRef.current = true;
            emitTypingStart(conversationId);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            emitTypingStop(conversationId);
        }, 2000);
    }, [conversationId, isConnected]);

    const stopTyping = useCallback(() => {
        if (!conversationId) return;

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (isTypingRef.current) {
            isTypingRef.current = false;
            emitTypingStop(conversationId);
        }
    }, [conversationId]);

    useEffect(() => {
        if (!socket || !conversationId || !isConnected) return;

        joinConversation(conversationId);

        const onReceive = (msg: ChatMessagePayload) => handlersRef.current.onMessage?.(msg);
        const onDelivered = (data: MessageStatusUpdate) =>
            handlersRef.current.onMessageDelivered?.(data);
        const onRead = (data: MessageStatusUpdate) =>
            handlersRef.current.onMessageRead?.(data);
        const onTypingStart = (data: { conversationId: string; userId: string }) =>
            handlersRef.current.onTypingStart?.(data);
        const onTypingStop = (data: { conversationId: string; userId: string }) =>
            handlersRef.current.onTypingStop?.(data);

        socket.on(SOCKET_EVENTS.MESSAGE_RECEIVE, onReceive);
        socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, onDelivered);
        socket.on(SOCKET_EVENTS.MESSAGE_READ, onRead);
        socket.on(SOCKET_EVENTS.TYPING_START, onTypingStart);
        socket.on(SOCKET_EVENTS.TYPING_STOP, onTypingStop);

        return () => {
            socket.off(SOCKET_EVENTS.MESSAGE_RECEIVE, onReceive);
            socket.off(SOCKET_EVENTS.MESSAGE_DELIVERED, onDelivered);
            socket.off(SOCKET_EVENTS.MESSAGE_READ, onRead);
            socket.off(SOCKET_EVENTS.TYPING_START, onTypingStart);
            socket.off(SOCKET_EVENTS.TYPING_STOP, onTypingStop);
            leaveConversation(conversationId);
        };
    }, [conversationId, isConnected, socket]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (isTypingRef.current && conversationId) {
                emitTypingStop(conversationId);
                isTypingRef.current = false;
            }
        };
    }, [conversationId]);

    const sendMessge = useCallback(
        (content: string) => {
            if (!conversationId) return;
            sendChatMessage({ conversationId, content, type: "text" });
        },
        [conversationId],
    );

    return { sendMessge, isConnected, notifyTyping, stopTyping };
}

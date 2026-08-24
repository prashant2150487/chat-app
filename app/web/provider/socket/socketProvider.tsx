"use client";
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { Socket } from "socket.io-client";
import { getSocket, connectSocket, disconnectSocket, SOCKET_EVENTS } from "@/lib/socket";
import { toast } from "sonner";

type SocketContextValue = {
    socket: Socket | null;
    isConnected: boolean;
};



const SocketContext = createContext<SocketContextValue>({
    socket: null,
    isConnected: false,
});

function getAccessToKen(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|; )accessToken=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}

export function SocketProvider({ children }: { children: ReactNode }) {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const token = getAccessToKen();
    useEffect(() => {
        if (!token) {
            disconnectSocket();
            setIsConnected(false);
            return;
        }
        const s = connectSocket(token);
        const onConnect = () => {
            setIsConnected(true);
        };
        const onDisconnect = () => {
            setIsConnected(false);
            toast.error("Live chat disconnected");
        };
        const onWelcome = (data: { message: string }) => {
            toast.success(data.message || "Live chat connected");
        };
        
        s.on("connect", onConnect);
        s.on("disconnect", onDisconnect);
        s.on("welcome", onWelcome);
        setIsConnected(s.connected);
        return () => {
            s.off("connect", onConnect);
            s.off("disconnect", onDisconnect);
            s.off("welcome", onWelcome);
            disconnectSocket();
            setIsConnected(false);
        }



    }, [token])
    const value = useMemo(() => ({ socket: getSocket(), isConnected: isConnected }), [isConnected])
    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    )
}

export function useSocket() {
    return useContext(SocketContext);
}
import { io, Socket } from "socket.io-client";
import { ChatMessage } from "../../types";

let socket: Socket | null = null;

export type CreateSocketOptions = {
  sessionId?: string | null;
};

export const createSocket = ({ sessionId }: CreateSocketOptions = {}) => {
  if (socket) return socket;

  const url = process.env.REACT_APP_SOCKET_URL as string;
  const path = process.env.REACT_APP_SOCKET_PATH || "/socket.io";
  const namespace = process.env.REACT_APP_SOCKET_NAMESPACE || "/";

  const autoConnect =
    (process.env.REACT_APP_SOCKET_AUTO_CONNECT || "true") === "true";

  const reconnectionAttempts =
    process.env.REACT_APP_SOCKET_RECONNECTION_ATTEMPTS === "Infinity"
      ? Infinity
      : Number(process.env.REACT_APP_SOCKET_RECONNECTION_ATTEMPTS || 0) ||
        Infinity;

  const reconnectionDelay = Number(
    process.env.REACT_APP_SOCKET_RECONNECTION_DELAY || 500
  );
  const reconnectionDelayMax = Number(
    process.env.REACT_APP_SOCKET_RECONNECTION_DELAY_MAX || 3000
  );
  const timeout = Number(process.env.REACT_APP_SOCKET_TIMEOUT || 10000);

  // WebSocket 전용. 필요 시 transports 옵션을 제거해 폴백 허용 가능
  socket = io(`${url}${namespace}`, {
    path,
    transports: ["websocket"],
    autoConnect,
    reconnection: true,
    reconnectionAttempts,
    reconnectionDelay,
    reconnectionDelayMax,
    timeout,
    withCredentials: true,
    auth: sessionId ? { sessionId } : undefined,
  });

  // 공통 로깅 (필요 시 제거)
  socket.on("connect", () => {
    console.log("[socket] connected", socket?.id);
  });
  socket.on("disconnect", (reason) => {
    console.log("[socket] disconnected", reason);
  });
  socket.on("connect_error", (err) => {
    console.error("[socket] connect_error:", err.message);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket)
    throw new Error("Socket not initialized. Call createSocket() first.");
  return socket;
};

export const updateSessionId = (next?: string | null) => {
  if (!socket) return;
};

export function joinRoom(roomId: string) {
  getSocket().emit("room:join", { roomId });
}

export function leaveRoom(roomId: string) {
  getSocket().emit("room:leave", { roomId });
}

export function sendMessage(payload: { roomId: string; text: string }) {
  return new Promise<{
    ok: boolean;
    serverId?: string;
    createdAt?: string;
    error?: string;
  }>((resolve) => {
    getSocket().emit("message:send", payload, (ack: any) => resolve(ack));
  });
}

// 수신 편의: 구독/해제 함수 반환
export function onNewMessage(handler: (m: ChatMessage) => void) {
  const s = getSocket();
  s.on("message:new", handler);
  return () => s.off("message:new", handler);
}

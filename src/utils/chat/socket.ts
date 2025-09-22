import { io, Socket } from "socket.io-client";
import { ChatMessage, PreviewItem, SendAck, SendPayload } from "../../types";
import { previewsToAttachments } from "./files";

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

// export function sendMessage(payload: { roomId: string; text: string }) {
//   return new Promise<{
//     ok: boolean;
//     serverId?: string;
//     createdAt?: string;
//     error?: string;
//   }>((resolve) => {
//     getSocket().emit("message:send", payload, (ack: any) => resolve(ack));
//   });
// }

const MAX_FILES = 4; // ✅ 요구사항
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 기본값 (원하면 조정)

export const sendMessage = async (
  roomId: string,
  opts: { text?: string; previews?: PreviewItem[]; serverId?: string } = {}
): Promise<SendAck> => {
  const { text, previews = [], serverId } = opts;

  if (!roomId) throw new Error("roomId가 필요합니다.");
  const hasText = !!text?.trim();
  const hasFiles = previews.length > 0;
  if (!hasText && !hasFiles) throw new Error("전송할 내용이 없습니다.");

  // 간단 검증
  if (previews.length > MAX_FILES) {
    throw new Error(`파일은 최대 ${MAX_FILES}개까지 전송할 수 있습니다.`);
  }
  for (const p of previews) {
    if (p.file.size > MAX_FILE_SIZE) {
      throw new Error(`"${p.name}" 파일이 최대 용량을 초과했습니다.`);
    }
  }

  const attachments = hasFiles
    ? await previewsToAttachments(previews)
    : undefined;

  const payload: SendPayload = {
    roomId,
    text: hasText ? text!.trim() : undefined,
    attachments,
    serverId, // 없으면 서버가 생성
  };

  const socket = getSocket();
  return new Promise<SendAck>((resolve) => {
    socket.emit("message:send", payload, (ack: SendAck) => resolve(ack));
  });
};

// 수신 편의: 구독/해제 함수 반환
export function onNewMessage(handler: (m: ChatMessage) => void) {
  const s = getSocket();
  s.on("message:new", handler);
  return () => s.off("message:new", handler);
}

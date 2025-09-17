import { io, Socket } from "socket.io-client";
import {
  GlobalRoomSummaryEvent,
  ReadUpdatedEvent,
  RoomUpdatedEvent,
} from "../types";
import { useRoomsStore } from "../store/roomsStore";

let socket: Socket | null = null;
let globalHandlersBound = false;

export function getSocket() {
  if (socket) return socket;

  const base = (
    process.env.REACT_APP_SERVER_URL ?? "http://localhost:4000"
  ).replace(/\/$/, "");
  socket = io(`${base}/chat`, {
    withCredentials: true,
    autoConnect: false, // 명시적으로 connect()
    transports: ["websocket"],
    auth: { sessionId: localStorage.getItem("sessionId") },
    reconnection: true,
    reconnectionDelayMax: 20_000, // 최대 백오프 20s
  });

  // 공통 로깅(선택)
  socket.on("connect", () => console.log("[ws] connected:", socket?.id));
  socket.on("disconnect", (reason) =>
    console.log("[ws] disconnected:", reason)
  );
  socket.on("connect_error", (err) =>
    console.warn("[ws] connect_error:", err?.message)
  );

  // 전역 리스너는 1회만 바인딩 (사이드바 요약/다중탭 동기화 등)
  if (!globalHandlersBound) {
    globalHandlersBound = true;

    socket.on("global:roomSummary", (p: GlobalRoomSummaryEvent) => {
      useRoomsStore.getState().updateRoomSummary(p); // id, lastMessage, lastMessageAt, memberCount, seqCounter 반영
    });

    socket.on("read:updated", (p: ReadUpdatedEvent) => {
      useRoomsStore.getState().applyReadUpdated(p); // unreadCount 재계산/리드마커 갱신
    });

    socket.on("room:updated", (p: RoomUpdatedEvent) => {
      useRoomsStore.getState().patchRoom(p.roomId, p.patch); // notice/memberCount 패치
    });
  }

  return socket;
}

// 인증/세션 갱신 시 호출하세요.
export function refreshSocketAuth(sessionId: string | null) {
  const s = getSocket();
  (s as any).auth = { sessionId };
  if (s.connected) {
    s.disconnect(); // 선택: 권장
    s.connect();
  }
}

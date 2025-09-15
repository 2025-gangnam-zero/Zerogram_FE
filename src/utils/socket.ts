import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (socket) return socket;

  socket = io(process.env.REACT_APP_SERVER_URL ?? "http://localhost:4000", {
    withCredentials: true,
    autoConnect: false, // 우리가 명시적으로 connect
    transports: ["websocket"], // 폴백 불필요하면 고정
    auth: { sessionId: localStorage.getItem("sessionId") },
  });

  // 기본 리스너 (선택)
  socket.on("connect", () => console.log("[ws] connected", socket?.id));
  socket.on("disconnect", (r) => console.log("[ws] disconnected:", r));
  socket.on("sys:hello", (payload) => console.log("[ws] hello:", payload));

  return socket;
}

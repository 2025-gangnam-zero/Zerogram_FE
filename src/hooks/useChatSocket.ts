// src/hooks/useChatSocket.ts
import { useEffect } from "react";
import { getSocket } from "../utils/socket";
import { useChatUIStore, useMessagesStore } from "../store";
import { ChatMessage } from "../types";

export function useChatSocket(roomIds: string[] = []) {
  const addMessage = useMessagesStore((s) => s.addMessage);
  const setTyping = useChatUIStore((s) => s.setTyping);
  
  useEffect(() => {
    const sock = getSocket();
    if (!sock.connected) sock.connect();

    // 방 참가
    roomIds.forEach((rid) => {
      sock.emit("room:join", { roomId: rid });
    });

    // 메시지 수신
    const onMsgNew = ({ msg }: { msg: ChatMessage }) => {
      // 메시지 저장(스토어/상태로)
      addMessage(msg.roomId, msg);
    };

    // 읽음/타이핑 등 추가 리스너
    const onTyping = (p: { roomId: string; userId: string; on: boolean }) => {
      setTyping(p.roomId, p.userId, p.on);
    };

    sock.on("msg:new", onMsgNew);
    sock.on("typing", onTyping);

    return () => {
      // 방 나가기 + 리스너 해제
      roomIds.forEach((rid) => {
        sock.emit("room:leave", { roomId: rid });
      });
      sock.off("msg:new", onMsgNew);
      sock.off("typing", onTyping);
      // sock.disconnect(); // 전역 싱글톤이면 보통 유지
    };
  }, [JSON.stringify(roomIds)]);
}

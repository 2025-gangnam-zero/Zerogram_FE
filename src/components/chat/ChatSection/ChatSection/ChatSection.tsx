import { useEffect, useMemo, useState } from "react";
import styles from "./ChatSection.module.css";
import { ChatHeader, MessageInput, MessageList } from "../../../chat";
import { useParams } from "react-router-dom";
import { chatMessagesByRoomId, CURRENT_USER } from "../../../../data/chat";
import { ChatMessage } from "../../../../types";
import { joinRoom, leaveRoom, onNewMessage, sendMessage } from "../../../../utils";

// 👇 소켓 유틸 가져오기


export const ChatSection = () => {
  const { roomid } = useParams();
  const [noticeOn, setNoticeOn] = useState(false);
  const [noticeText] = useState("오늘 19:00 한강 러닝 공지 — 참여하실 분은 🖐");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false); // 전송 상태(선택)

  // 방 변경 시 mock 초기 메시지 로드 (초기 데이터가 있다면 유지)
  useEffect(() => {
    if (!roomid) {
      setMessages([]);
      return;
    }
    setMessages(chatMessagesByRoomId[roomid] ?? []);
  }, [roomid]);

  // ✅ 방 입장/퇴장 + 서버 브로드캐스트 수신
  useEffect(() => {
    if (!roomid) return;

    // 방 입장
    joinRoom(roomid);

    // 수신 구독 (멀티룸 필터)
    const off = onNewMessage((msg) => {
      if (msg.roomId !== roomid) return;
      setMessages((prev) => [...prev, msg]);
    });

    // 언마운트/방 변경 시 정리
    return () => {
      off();
      leaveRoom(roomid);
    };
  }, [roomid]);

  // ✅ 전송: 서버로 보내고, 수신은 브로드캐스트로만 반영(낙관적 추가 X)
  const handleSend = async (text: string) => {
    if (!roomid) return;
    try {
      setSending(true);
      const ack = await sendMessage({ roomId: roomid, text });
      if (!ack.ok) {
        // TODO: 토스트/에러 처리
        console.error("send failed:", ack.error);
      }
      // 낙관적 추가는 하지 않음: 서버가 즉시 message:new로 에코해줌
    } finally {
      setSending(false);
    }
  };

  const title = useMemo(() => `방 ${roomid ?? ""}`, [roomid]);

  return (
    <section className={styles.section}>
      <ChatHeader
        title={title}
        noticeEnabled={noticeOn}
        onToggleNotice={() => setNoticeOn((v) => !v)}
        onAction={(a) => {
          // TODO: 더보기 메뉴 액션 처리
          console.log("[MoreMenu Action]", a);
        }}
      />

      <MessageList
        showNotice={noticeOn}
        noticeText={noticeText}
        messages={messages}
        currentUserId={CURRENT_USER.id}
      />

      <MessageInput onSend={handleSend} disabled={sending} />
    </section>
  );
};

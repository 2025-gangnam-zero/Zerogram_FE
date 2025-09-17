import { useEffect, useMemo, useState } from "react";
import styles from "./ChatSection.module.css";
import { ChatHeader, MessageInput, MessageList } from "../../../chat";
import { useParams } from "react-router-dom";
import { chatMessagesByRoomId, CURRENT_USER } from "../../../../data/chat";
import { ChatMessage } from "../../../../types";

const mkId = (prefix = "m") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const ChatSection = () => {
  const { roomid } = useParams();
  const [noticeOn, setNoticeOn] = useState(false);
  const [noticeText] = useState("오늘 19:00 한강 러닝 공지 — 참여하실 분은 🖐");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 방 변경 시 mock 데이터 로드
  useEffect(() => {
    if (!roomid) {
      setMessages([]);
      return;
    }
    setMessages(chatMessagesByRoomId[roomid] ?? []);
  }, [roomid]);

  // 전송
  const handleSend = (text: string) => {
    if (!roomid) return;
    const newMsg: ChatMessage = {
      id: mkId(roomid),
      text,
      createdAt: new Date(),
      author: CURRENT_USER,
      meta: { readCount: 0 },
    };
    setMessages((prev) => [...prev, newMsg]);
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

      <MessageInput onSend={handleSend} />
    </section>
  );
};

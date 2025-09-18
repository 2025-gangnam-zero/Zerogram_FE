import { useEffect, useRef } from "react";
import styles from "./MessageList.module.css";
import { MessageItem, NoticeBanner } from "../../../../components/chat";
import type { ChatMessage } from "../../../../types";

type Props = {
  showNotice?: boolean;
  noticeText?: string;
  messages: ChatMessage[];
  currentUserId: string;
};

export const MessageList = ({ showNotice, noticeText, messages }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);

  // 새 메시지 도착 시 하단으로 스크롤
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  return (
    <div className={styles.container} ref={ref}>
      {showNotice && noticeText && <NoticeBanner text={noticeText} sticky />}
      {messages.map((m) => (
        <MessageItem key={m.id} message={m} />
      ))}
    </div>
  );
};

import { useMemo } from "react";
import styles from "./ChatSection.module.css";
import { CHThread, Message } from "../../../types";
import { ChatHeader } from "../ChatHeader";
import { MessageInput } from "../MessageInput";
import { MessageList } from "../MessageList";
import { me, mockMessages } from "../../../data/data";
import { DNDWrapper } from "../DNDWrapper";

interface ChatSectionProps {
  disabled?: boolean;
  crs: CHThread[];   // 여러 채팅방(스레드)
  activeId: string;  // 현재 활성화된 방 id
}

export const ChatSection = ({ crs, activeId, disabled }: ChatSectionProps) => {
  const active = useMemo(
    () => crs.find((thread) => thread.id === activeId),
    [activeId, crs]
  );

  const messages: Message[] = useMemo(
    () => (active ? mockMessages[active.id] ?? [] : []),
    [active]
  );

  const handleSend = (text: string) => {
    if (!active) return;
    console.log("SEND:", { text, to: active.id });
    // 실제 앱에서는 API 호출 로직이 들어가야 함
  };

  return (
    <section className={styles.chat}>
      {/* ✅ 단체방에 맞게 room 정보 전달 */}
      <ChatHeader
        room={active?.room}
        subtitle="Google Meet 4시 접속 확인"
      />
      <DNDWrapper>
        <MessageList messages={messages} meId={me.id} />
        {!disabled && <MessageInput onSend={handleSend} />}
      </DNDWrapper>
    </section>
  );
};

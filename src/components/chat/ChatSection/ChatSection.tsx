import { useComposerStore } from "../../../store";
import {
  ChatHeader,
  DNDWrapper,
  MessageInput,
  MessageList,
} from "../../../components/chat";
import styles from "./ChatSection.module.css";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

export const ChatSection = () => {
  const { roomId } = useParams();

  const ensureRoom = useComposerStore((s) => s.ensureRoom);

  useEffect(() => {
    if (roomId) ensureRoom(roomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]); // ensureRoom 제거 - 함수는 의존성 배열에 포함하지 않음

  if (!roomId)
    return <section className={styles.container}>채팅방을 선택하세요.</section>;

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <ChatHeader />
      </header>

      {/* ✅ DND로 리스트+인풋 감싸기 (roomId 단위) */}
      <DNDWrapper roomId={roomId}>
        <div className={styles.messageArea}>
          <MessageList />
        </div>
        <footer className={styles.inputArea}>
          <MessageInput />
        </footer>
      </DNDWrapper>
    </section>
  );
};

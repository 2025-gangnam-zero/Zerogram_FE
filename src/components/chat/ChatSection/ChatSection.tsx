import { mockItems } from "../../../data/chat.mock";
import { useComposerStore } from "../../../store";
import {
  ChatHeader,
  DNDWrapper,
  MessageInput,
  MessageList,
} from "../../../components/chat";
import styles from "./ChatSection.module.css";
import { useParams } from "react-router-dom";

export const ChatSection = () => {
  const { roomId } = useParams();
  const room = mockItems.find((r) => r.id === roomId) ?? mockItems[0];

  const ensureRoom = useComposerStore((s) => s.ensureRoom);
  if (roomId) ensureRoom(roomId); // 간단 보장

  if (!roomId)
    return <section className={styles.container}>채팅방을 선택하세요.</section>;

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <ChatHeader
          roomName={room.roomName}
          roomDescription={room.roomDescription}
          memberCount={room.memberCount}
          memberCapacity={room.memberCapacity}
          roomImageUrl={room.roomImageUrl}
        />
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

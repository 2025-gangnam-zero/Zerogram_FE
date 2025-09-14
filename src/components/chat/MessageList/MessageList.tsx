import { useState } from "react";
import styles from "./MessageList.module.css";
import { useParams } from "react-router-dom";
import { ImageLightbox, MessageItem } from "../../../components/chat";
import { useMessagesStore } from "../../../store";

export const MessageList = () => {
  const { roomId } = useParams<{ roomId: string }>();

  // 직접 상태를 구독하여 무한 리렌더링 방지
  const byRoomId = useMessagesStore((s) => s.byRoomId);
  const messages = roomId ? byRoomId[roomId]?.items ?? [] : [];

  const [lbOpen, setLbOpen] = useState(false);
  const [lbImages, setLbImages] = useState<string[]>([]);
  const [lbIndex, setLbIndex] = useState(0);

  const handleImageClick = (_url: string, index: number, all: string[]) => {
    setLbImages(all);
    setLbIndex(index);
    setLbOpen(true);
  };

  if (!roomId) {
    return <div className={styles.empty}>채팅방이 선택되지 않았습니다.</div>;
  }
  if (messages.length === 0) {
    return <div className={styles.empty}>메시지가 없습니다.</div>;
  }

  return (
    <>
      <div className={styles.list} role="list" aria-label="메시지 목록">
        {messages.map((m) => (
          <MessageItem key={m.id} message={m} onImageClick={handleImageClick} />
        ))}
      </div>

      <ImageLightbox
        open={lbOpen}
        images={lbImages}
        index={lbIndex}
        onClose={() => setLbOpen(false)}
      />
    </>
  );
};

// src/components/chat/ChatSection/MessageItem/MessageItem.tsx
import styles from "./MessageItem.module.css";
import { formatTimeKo } from "../../../../utils";
import type { ChatMessage, ChatUser } from "../../../../types";
import { useUserStore } from "../../../../store";

type Props = {
  message: ChatMessage;
};

export const CURRENT_USER: ChatUser = {
  id: "u-001",
  name: "나",
  // avatarUrl: ""  // 필요 시 추가
};

export const MessageItem = ({ message }: Props) => {
  // const currentUserId = useUserStore((s) => s.id);

  const { text, createdAt, author, meta } = message;
  const isMe = author.id === CURRENT_USER.id;
  const time = formatTimeKo(createdAt);

  if (isMe) {
    return (
      <div className={`${styles.item} ${styles.me}`}>
        <div className={styles.row}>
          {/* ⬇︎ metaCol: 읽음수 위, 시간 아래(세로) */}
          <div className={styles.metaCol}>
            {typeof meta?.readCount === "number" && meta.readCount !== 0 && (
              <span className={styles.readCount}>{meta.readCount}</span>
            )}
            <span className={styles.time}>{time}</span>
          </div>
          <div className={`${styles.bubble} ${styles.meBubble}`}>{text}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.item} ${styles.other}`}>
      <div className={styles.avatarWrap}>
        {author.avatarUrl ? (
          <img className={styles.avatar} src={author.avatarUrl} alt="" />
        ) : (
          <div className={styles.avatarFallback}>
            {(author.name?.[0] ?? "?").toUpperCase()}
          </div>
        )}
      </div>

      <div className={styles.content}>
        {author.name && <div className={styles.sender}>{author.name}</div>}
        <div className={styles.row}>
          {/* 말풍선(좌) */}
          <div className={`${styles.bubble} ${styles.otherBubble}`}>{text}</div>

          {/* ⬇️ metaCol: 읽음수 위, 시간 아래(세로) — 다른 사용자용 */}
          <div className={`${styles.metaCol} ${styles.metaColOther}`}>
            {typeof meta?.readCount === "number" && meta.readCount !== 0 && (
              <span className={styles.readCount}>{meta.readCount}</span>
            )}
            <span className={styles.time}>{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

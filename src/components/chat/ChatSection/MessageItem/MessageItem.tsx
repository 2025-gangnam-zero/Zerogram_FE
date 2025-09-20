import { useEffect } from "react";
import styles from "./MessageItem.module.css";
import { formatTimeKo } from "../../../../utils";
import type { ChatMessage } from "../../../../types";
import { useAuthStore, useUserStore } from "../../../../store";

type Props = {
  message: ChatMessage;
};

export const MessageItem = ({ message }: Props) => {
  const { isLoggedIn, checkAuthStatus } = useAuthStore();
  const { id: userId, fetchUserInfo } = useUserStore();

  useEffect(() => {
    const actualIsLoggedIn = checkAuthStatus();

    if (actualIsLoggedIn) {
      fetchUserInfo().catch((error: unknown) => {
        console.error("사용자 정보 조회 실패:", error);
      });
    }
  }, [isLoggedIn, fetchUserInfo, checkAuthStatus]);

  const { text, createdAt, author, meta } = message;

  const isMe = author.id === userId;
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

import { useEffect } from "react";
import styles from "./MessageItem.module.css";
import { formatTimeKo } from "../../../../utils";
import type { Attachment, ChatMessage } from "../../../../types";
import { useAuthStore, useUserStore } from "../../../../store";
import { MessageAttachments } from "../MessageAttachments/MessageAttachments";

type Props = { message: ChatMessage };

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

  const { text, createdAt, author, meta, attachments } = message;
  const isMe = author.userId === userId;
  const time = formatTimeKo(createdAt);

  // 말풍선 + 첨부를 세로로 쌓기 위한 공용 뷰
  const TextAndAttachments = ({ side }: { side: "me" | "other" }) => (
    <div className={styles.stack}>
      {text && (
        <div
          className={`${styles.bubble} ${
            side === "me" ? styles.meBubble : styles.otherBubble
          }`}
        >
          {text}
        </div>
      )}

      {/* ⬇︎ 말풍선 밖/아래에 첨부 표시 */}
      {attachments && attachments.length > 0 && (
        <MessageAttachments
          attachments={attachments as Attachment[]}
          side={side}
        />
      )}
    </div>
  );

  if (isMe) {
    return (
      <div className={`${styles.item} ${styles.me}`}>
        <div className={styles.row}>
          <div className={styles.metaCol}>
            {typeof meta?.readCount === "number" && meta.readCount !== 0 && (
              <span className={styles.readCount}>{meta.readCount}</span>
            )}
            <span className={styles.time}>{time}</span>
          </div>
          <TextAndAttachments side="me" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.item} ${styles.other}`}>
      <div className={styles.avatarWrap}>
        {author.profile_image ? (
          <img className={styles.avatar} src={author.profile_image} alt="" />
        ) : (
          <div className={styles.avatarFallback}>
            {(author.nickname?.[0] ?? "?").toUpperCase()}
          </div>
        )}
      </div>

      <div className={styles.content}>
        {author.nickname && (
          <div className={styles.sender}>{author.nickname}</div>
        )}
        <div className={styles.row}>
          {/* 좌측: 말풍선/첨부 */}
          <TextAndAttachments side="other" />

          {/* 우측: 메타(읽음수/시간) */}
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

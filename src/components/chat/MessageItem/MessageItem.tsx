import { Message, RoomMember } from "../../../types";
import styles from "./MessageItem.module.css";
import { computeUnreadCount } from "../../../utils";

type Props = {
  message: Message;
  mine?: boolean;
  members: RoomMember[]; // ✅ 방 멤버 목록(타임라인 포함)
  showReceiptFor?: "mine" | "all"; // 기본 "mine": 내가 보낸 메시지에만 표시
  includeAuthorInCount?: boolean; // 기본 false
};

export const MessageItem: React.FC<Props> = ({
  message,
  mine,
  members,
  showReceiptFor = "mine",
  includeAuthorInCount = false,
}) => {
  const shouldShow =
    showReceiptFor === "all" || (showReceiptFor === "mine" && mine);

  const unreadCount = shouldShow
    ? computeUnreadCount(message, members, {
        includeAuthor: includeAuthorInCount,
      })
    : 0;

  return (
    <div className={mine ? styles.rowMine : styles.row}>
      {!mine && (
        <img
          className={styles.avatar}
          src={message.authorAvatarUrl}
          alt={message.authorName}
        />
      )}

      <div className={styles.inline}>
        {" "}
        {/* ← 버블과 뱃지를 한 줄로 */}
        {/* 왼쪽 버블(상대 메시지)일 때: 뱃지를 버블 오른쪽에 */}
        {!mine && (
          <>
            <div className={styles.bubble}>
              <div className={styles.header}>
                <span className={styles.author}>{message.authorName}</span>
                <span className={styles.time}>
                  {new Date(message.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <div className={styles.content}>{message.content}</div>
            </div>
            {shouldShow && (
              <span
                className={
                  unreadCount > 0 ? styles.receiptUnread : styles.receiptRead
                }
                aria-label={
                  unreadCount > 0 ? `안 읽음 ${unreadCount}` : "모두 읽음"
                }
                title={unreadCount > 0 ? `안 읽음 ${unreadCount}` : "모두 읽음"}
              >
                {unreadCount > 0 ? `안읽음 ${unreadCount}` : "모두 읽음"}
              </span>
            )}
          </>
        )}
        {/* 오른쪽 버블(내 메시지)일 때: 뱃지를 버블 왼쪽에 */}
        {mine && (
          <>
            {shouldShow && (
              <span
                className={
                  unreadCount > 0 ? styles.receiptUnread : styles.receiptRead
                }
                aria-label={
                  unreadCount > 0 ? `안 읽음 ${unreadCount}` : "모두 읽음"
                }
                title={unreadCount > 0 ? `안 읽음 ${unreadCount}` : "모두 읽음"}
              >
                {unreadCount > 0 ? `${unreadCount}` : ""}
              </span>
            )}
            <div className={styles.bubble}>
              <div className={styles.header}>
                <span className={styles.author}>{message.authorName}</span>
                <span className={styles.time}>
                  {new Date(message.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <div className={styles.content}>{message.content}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

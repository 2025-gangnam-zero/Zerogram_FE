import { CHThread } from "../../../types";
import { formatLastMessagePreview, formatRelativeTime } from "../../../utils";
import styles from "./CRItem.module.css";

type Props = {
  cr: CHThread;
  active?: boolean;
  onClick?: () => void;
  meId?: string; // 선택: "나:" 접두어를 붙이고 싶으면 전달
};

export const CRItem: React.FC<Props> = ({ cr, active, onClick, meId }) => {
  const preview = formatLastMessagePreview(cr.lastMessage, meId, {
    showAuthor: false,
    maxLen: 40,
  });
  const time = cr.lastMessage?.createdAt
    ? formatRelativeTime(cr.lastMessage.createdAt)
    : "";

  return (
    <button
      className={active ? styles.itemActive : styles.item}
      onClick={onClick}
      aria-label={cr.room.roomName}
    >
      <img
        className={styles.avatar}
        src={cr.room.roomImageUrl}
        alt={cr.room.roomName}
      />
      <div className={styles.meta}>
        {/* 1행: 이름 + 시간 */}
        <div className={styles.topRow}>
          <span className={styles.name}>{cr.room.roomName}</span>
          {time && <span className={styles.time}>{time}</span>}
        </div>

        {/* 2행: 미리보기 + 뱃지 */}
        <div className={styles.bottomRow}>
          <div className={styles.preview}>{preview}</div>
          {cr.unreadCount > 0 && (
            <span className={styles.badge}>{cr.unreadCount}</span>
          )}
        </div>
      </div>
    </button>
  );
};

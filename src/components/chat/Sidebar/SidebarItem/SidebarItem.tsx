import { Link, useParams } from "react-router-dom";
import styles from "./SidebarItem.module.css";
import { Users, Clock } from "lucide-react";
import { formatTimeKo } from "../../../../utils";
import { SidebarListItemData } from "../../../../types";

export type SidebarVariant = "mine" | "public";

type Props = {
  item: SidebarListItemData;
  selected?: boolean;
  variant: "mine" | "public";
  onSelect?: (roomId: string) => void; // ✅ 추가: 드로어 닫기 신호
};

export const SidebarItem = ({
  item,
  selected = false,
  variant,
  onSelect,
}: Props) => {
  const {
    id,
    roomName,
    imageUrl,
    memberCount,
    lastMessage,
    lastMessageAt,
    unreadCount,
  } = item;

  const { roomid } = useParams(); // ← 라우트 파라미터 키가 실제로 'roomid'인지 확인!
  const isSelected = selected || (roomid && String(roomid) === String(id));

  return (
    <li
      className={[
        styles.item,
        isSelected ? styles.selected : "",
        !!unreadCount && unreadCount > 0 && !selected ? styles.hasUnread : "",
      ].join(" ")}
    >
      <Link
        to={`/chat/${id}`}
        className={styles.link}
        onClick={() => onSelect?.(id)} // ✅ 방 클릭 시 드로어 닫기 상위 신호
      >
        <div className={styles.avatarWrap}>
          {imageUrl ? (
            <img className={styles.avatar} src={imageUrl} alt="" />
          ) : (
            <div className={styles.avatarFallback}>{roomName?.[0] ?? "?"}</div>
          )}
        </div>

        <div className={styles.body}>
          {/* 상단: 왼쪽(제목 + 멤버수 [+ 공개배지]) — 오른쪽(시간) */}
          <div className={styles.topRow}>
            <div className={styles.topLeft}>
              <span className={styles.title} title={roomName}>
                {roomName}
              </span>

              {/* 멤버 수(아이콘+숫자) - 제목 옆 */}
              {typeof memberCount === "number" && (
                <span className={styles.members}>
                  <Users className={styles.memberIcon} aria-hidden />
                  {memberCount}
                </span>
              )}
            </div>

            {/* (주석과 표시 조건을 맞추려면 variant 체크를 추가하세요) */}
            {lastMessageAt && (
              <span className={styles.topTime} title={lastMessageAt}>
                <Clock className={styles.timeIcon} aria-hidden />
                {formatTimeKo(lastMessageAt)}
              </span>
            )}
          </div>

          {/* 중앙: 마지막 메시지(좌) — 읽지않음(우) */}
          <div className={styles.metaRow}>
            <span className={styles.lastMsg} title={lastMessage}>
              {lastMessage ?? ""}
            </span>
            {!!unreadCount && unreadCount > 0 && (
              <span className={styles.unread}>{unreadCount}</span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
};

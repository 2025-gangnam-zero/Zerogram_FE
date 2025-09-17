import { Link } from "react-router-dom";
import styles from "./SidebarItem.module.css";
import { Users, Globe, Clock } from "lucide-react";
import { formatTimeKo } from "../../../../utils";

export type SidebarVariant = "mine" | "public";

export type SidebarListItemData = {
  id: string;
  roomName: string;
  imageUrl?: string;
  memberCount?: number;
  lastMessage?: string; // mine 전용
  lastMessageAt?: string; // mine 전용 (ISO or 포맷 문자열)
  unreadCount?: number; // mine 전용
};

type Props = {
  item: SidebarListItemData;
  selected?: boolean;
  variant: SidebarVariant;
};

export const SidebarItem = ({ item, selected = false, variant }: Props) => {
  const {
    id,
    roomName,
    imageUrl,
    memberCount,
    lastMessage,
    lastMessageAt,
    unreadCount,
  } = item;

  return (
    <li className={`${styles.item} ${selected ? styles.selected : ""}`}>
      <Link to={`/chat/${id}`} className={styles.link}>
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

              {variant === "public" && (
                <span className={styles.publicBadge}>
                  <Globe className={styles.badgeIcon} aria-hidden />
                  공개
                </span>
              )}
            </div>

            {/* mine일 때만 시간(우측) */}
            {variant === "mine" && lastMessageAt && (
              <span className={styles.topTime} title={lastMessageAt}>
                <Clock className={styles.timeIcon} aria-hidden />
                {formatTimeKo(lastMessageAt)}
              </span>
            )}
          </div>

          {/* 중앙: 마지막 메시지(좌) — 읽지않음(우) */}
          {variant === "mine" && (
            <div className={styles.metaRow}>
              <span className={styles.lastMsg} title={lastMessage}>
                {lastMessage ?? ""}
              </span>
              {!!unreadCount && unreadCount > 0 && (
                <span className={styles.unread}>{unreadCount}</span>
              )}
            </div>
          )}
          {/* ⬇️ 하단 statsRow는 제거(이제 상단으로 올렸기 때문) */}
        </div>
      </Link>
    </li>
  );
};

// src/components/chat/SidebarPublicList.tsx
import styles from "./SidebarPublicList.module.css";
import type { PublicRoomListItemDto } from "../../../types";
import { SidebarPublicListItem } from "../SidebarPublicListItem";

type Props = {
  loading: boolean;
  rooms: PublicRoomListItemDto[];
  onRefresh: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  renderItem?: (item: PublicRoomListItemDto) => React.ReactNode;
};

export const SidebarPublicList = ({
  loading,
  rooms,
  onRefresh,
  onLoadMore,
  hasMore,
  renderItem,
}: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <span className={styles.title}>공개 방 목록</span>
        <button className={styles.refreshBtn} onClick={onRefresh}>
          새로고침
        </button>
      </div>

      {loading && rooms.length === 0 ? (
        <div className={styles.empty}>불러오는 중…</div>
      ) : rooms.length === 0 ? (
        <div className={styles.empty}>공개 방이 없습니다.</div>
      ) : (
        <ul className={styles.list} role="list">
          {rooms.map((r) => (
            <li key={r.id}>
              {renderItem ? renderItem(r) : <div>{r.roomName}</div>}
            </li>
          ))}
        </ul>
      )}

      <div className={styles.footerRow}>
        {hasMore ? (
          <button
            className={styles.moreBtn}
            disabled={loading}
            onClick={onLoadMore}
          >
            더 보기
          </button>
        ) : (
          <span className={styles.endText}>끝</span>
        )}
      </div>
    </div>
  );
};

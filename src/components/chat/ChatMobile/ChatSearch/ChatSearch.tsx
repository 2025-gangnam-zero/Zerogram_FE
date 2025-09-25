import { useEffect, useMemo, useState } from "react";
import styles from "./ChatSearch.module.css";
import { SearchBar, SidebarList } from "../../../chat"; // 기존 컴포넌트 재사용
import { SidebarListItemData } from "../../../../types";
import { getMyRoomsApi } from "../../../../api/chat";

type Props = { open: boolean; onClose: () => void };

export const ChatSearch = ({ open, onClose }: Props) => {
  const [query, setQuery] = useState("");
  const [rooms, setRooms] = useState<SidebarListItemData[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await getMyRoomsApi({ limit: 100 });
        setRooms(res?.data?.items ?? []);
      } catch (e) {
        console.error("[ChatSearch] getMyRoomsApi failed", e);
      }
    })();
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? rooms.filter((r) => r.roomName.toLowerCase().includes(q))
      : rooms;
  }, [query, rooms]);

  if (!open) return null;

  return (
    <div
      className={styles.sheet}
      role="dialog"
      aria-modal="true"
      aria-label="채팅방 검색"
    >
      <div className={styles.header}>
        <SearchBar
          defaultValue={query}
          placeholder="채팅방 검색"
          autoFocus
          onChange={setQuery}
          onSubmit={setQuery}
        />
        <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
          닫기
        </button>
      </div>
      <div className={styles.body}>
        <SidebarList items={filtered} variant="mine" />
      </div>
    </div>
  );
};

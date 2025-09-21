import { useEffect, useMemo, useState } from "react";
import styles from "./Sidebar.module.css";
import { SidebarList, SearchBar } from "../../../chat";
import { SidebarListItemData } from "../../../../types";
import { getMyRoomsApi } from "../../../../api/chat";

export const Sidebar = () => {
  const [query, setQuery] = useState("");
  const [mineRooms, setMineRooms] = useState<SidebarListItemData[]>([]);

  // 최초 로드: 내 방 목록
  useEffect(() => {
    (async () => {
      try {
        const res = await getMyRoomsApi({ limit: 50 });
        const items = res?.data?.items ?? [];

        console.log(items);

        setMineRooms(items);
      } catch (e) {
        console.error("[Sidebar] getMyRoomsApi failed:", e);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mineRooms;
    return mineRooms.filter((r) => r.roomName.toLowerCase().includes(q));
  }, [query, mineRooms]);

  return (
    <div className={styles.sidebar}>
      <SearchBar onChange={setQuery} onSubmit={setQuery} />
      <div className={styles.listArea}>
        <SidebarList items={filtered} />
      </div>
    </div>
  );
};

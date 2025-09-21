import { useEffect, useMemo, useState } from "react";
import styles from "./Sidebar.module.css";
import { SidebarList, SearchBar } from "../../../chat";
import { SidebarListItemData } from "../../../../types";
import { getMyRoomsApi } from "../../../../api/chat";
import { eventBus } from "../../../../utils";

export const Sidebar = () => {
  const [query, setQuery] = useState("");
  const [mineRooms, setMineRooms] = useState<SidebarListItemData[]>([]);

  const refetch = async () => {
    try {
      const res = await getMyRoomsApi({ limit: 50 });
      const items = res?.data?.items ?? [];
      setMineRooms(items);
    } catch (e) {
      console.error("[Sidebar] getMyRoomsApi failed:", e);
    }
  };

  // 최초 로드
  useEffect(() => {
    refetch();
  }, []);

  // ✅ 사이드바 목록 새로고침 트리거 구독
  useEffect(() => {
    const off = eventBus.on("rooms:refresh", () => refetch());
    return () => off();
  }, []);

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

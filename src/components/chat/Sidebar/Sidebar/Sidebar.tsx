import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import styles from "./Sidebar.module.css";
import { SidebarList, SearchBar } from "../../../chat";
import { ChatMessage, SidebarListItemData } from "../../../../types";
import { getMyRoomsApi } from "../../../../api/chat";
import {
  applyIncomingMessageToRooms,
  eventBus,
  onNewMessage,
  joinRoom, // ✅ socket 유틸에 이미 있음 (Model Set Context #36)
} from "../../../../utils";

export const Sidebar = () => {
  const [query, setQuery] = useState("");
  const [mineRooms, setMineRooms] = useState<SidebarListItemData[]>([]);
  const joinedRef = useRef<Set<string>>(new Set()); // ✅ 이미 조인한 방 기록

  const joinAllMyRooms = useCallback((rooms: SidebarListItemData[]) => {
    for (const r of rooms) {
      if (!joinedRef.current.has(r.id)) {
        joinRoom(r.id);
        joinedRef.current.add(r.id);
      }
    }
  }, []);

  const refetch = useCallback(async () => {
    try {
      const res = await getMyRoomsApi({ limit: 50 });
      const items = res?.data?.items ?? [];
      setMineRooms(items);
      joinAllMyRooms(items); // ✅ 목록 갱신 후 전체 조인
    } catch (e) {
      console.error("[Sidebar] getMyRoomsApi failed:", e);
    }
  }, [joinAllMyRooms]);

  // 최초 1회 로드
  useEffect(() => {
    refetch();
  }, [refetch]);

  // rooms:refresh 이벤트 구독
  useEffect(() => {
    const off = eventBus.on("rooms:refresh", () => refetch());
    return () => off();
  }, [refetch]);

  // 새 메시지 수신 → 목록 갱신
  useEffect(() => {
    const off = onNewMessage((msg: ChatMessage) => {
      // 만약 아직 조인 안 된 방에서 온 메시지라면 조인(예외 안전)
      if (!joinedRef.current.has(msg.roomId)) {
        joinRoom(msg.roomId);
        joinedRef.current.add(msg.roomId);
      }
      setMineRooms((prev) => applyIncomingMessageToRooms(prev, msg));
    });
    return () => {
      typeof off === "function" && off();
    };
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

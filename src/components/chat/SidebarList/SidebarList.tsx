import styles from "./SidebarList.module.css";
import { SidebarListItem } from "../SidebarListItem";
import { useChatDataStore } from "../../../store";
import { useMemo } from "react";

export const SidebarList = () => {
  // 직접 상태를 구독하여 무한 리렌더링 방지
  const rooms = useChatDataStore((s) => s.rooms);
  const roomOrder = useChatDataStore((s) => s.roomOrder);
  const readState = useChatDataStore((s) => s.readState);
  const messagesByRoom = useChatDataStore((s) => s.messagesByRoom);

  // useMemo로 계산된 rooms 리스트를 메모이제이션
  const roomsList = useMemo(() => {
    const arr = roomOrder
      .map((id) => rooms[id])
      .filter(Boolean);

    const withRecent = arr.map((r) => {
      const msgs = messagesByRoom[r.id] ?? [];
      const last = msgs.length
        ? msgs[msgs.length - 1].createdAt
        : r.lastMessageAt ?? "";
      return { room: r, lastAt: last };
    });

    return withRecent
      .sort((a, b) => {
        if (a.room.isPinned && !b.room.isPinned) return -1;
        if (!a.room.isPinned && b.room.isPinned) return 1;
        return 0;
      })
      .map(({ room }) => ({
        ...room,
        unreadCount: readState[room.id]?.unreadCount ?? 0,
      }));
  }, [rooms, roomOrder, readState, messagesByRoom]);

  return (
    <div className={styles.wrap} role="list" aria-label="채팅방 목록">
      {roomsList.map((item) => (
        <SidebarListItem key={item.id} item={item} />
      ))}
    </div>
  );
};

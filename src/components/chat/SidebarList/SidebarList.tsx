import styles from "./SidebarList.module.css";
import { SidebarListItem } from "../SidebarListItem";
import { useMemo } from "react";
import { useRoomsStore, useMessagesStore } from "../../../store";

export const SidebarList = () => {
  // 방 상태
  const byId = useRoomsStore((s) => s.byId);
  const allIds = useRoomsStore((s) => s.allIds);

  // 메시지 상태 (roomId별 { items, nextBeforeId })
  const byRoomId = useMessagesStore((s) => s.byRoomId);

  const roomsList = useMemo(() => {
    const toTs = (v: unknown) => (v ? new Date(v as any).getTime() || 0 : 0);

    const arr = allIds
      .map((id) => byId[id])
      .filter(Boolean)
      .map((room) => {
        const msgs = byRoomId[room.id]?.items ?? [];
        const lastMsgAt = msgs.length ? msgs[msgs.length - 1].createdAt : null;
        const lastAt = lastMsgAt ?? room.lastMessageAt ?? null;

        // readState를 따로 두지 않고, room.unreadCount가 스토어에 있다면 그대로 사용
        const unreadCount = (room as any).unreadCount ?? 0;

        return { ...room, unreadCount, __lastAt: lastAt };
      })
      .sort((a, b) => {
        // pinned 우선
        const pa = a.isPinned ? 1 : 0;
        const pb = b.isPinned ? 1 : 0;
        if (pa !== pb) return pb - pa;

        // 최근 메시지/시각 내림차순
        const ta = toTs(a.__lastAt);
        const tb = toTs(b.__lastAt);
        if (ta !== tb) return tb - ta;

        // 이름순
        return a.roomName.localeCompare(b.roomName, "ko", {
          sensitivity: "base",
        });
      })
      .map(({ __lastAt, ...room }) => room); // 내부 계산용 필드 제거

    return arr;
  }, [allIds, byId, byRoomId]);

  return (
    <div className={styles.wrap} role="list" aria-label="채팅방 목록">
      {roomsList.map((item) => (
        <SidebarListItem key={item.id} item={item} />
      ))}
    </div>
  );
};

// src/pages/ChatPage/ChatPage.tsx
import styles from "./ChatPage.module.css";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/chat";

import { useEffect } from "react";

import { useRoomsStore } from "../../store";
import { useChatSocket } from "../../hooks/useChatSocket";
import { listMyJoinedRoomsApi } from "../../api/room";

export const ChatPage = () => {
  const replaceRooms = useRoomsStore((s) => s.replaceRooms);
  const setLoading = useRoomsStore((s) => s.setLoading);
  const setError = useRoomsStore((s) => s.setError);

  const rooms = useRoomsStore((s) => s.allIds);

  useChatSocket(rooms);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const { items, nextCursor } = await listMyJoinedRoomsApi({ limit: 30 });

        replaceRooms({ items, nextCursor });
      } catch (e: any) {
        setError(e?.message ?? "rooms fetch failed");
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 함수들은 의존성 배열에서 제거

  return (
    <div className={styles.wrap}>
      <aside className={styles.sidebar}>
        <Sidebar />
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
      {/* ✅ 모달 포탈 루트 (ChatPage 범위 안에서 중앙 정렬을 하기 위함) */}
      <div id="chatpage-modal-root" />
    </div>
  );
};

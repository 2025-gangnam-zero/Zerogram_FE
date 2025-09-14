// src/pages/ChatPage/ChatPage.tsx
import styles from "./ChatPage.module.css";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/chat";
import { useChatDataStore } from "../../store/chatDataStore";
import { useEffect } from "react";
import { mockItems, mockMessages } from "../../data/chat.mock";

export const ChatPage = () => {
  const bootstrap = useChatDataStore((s) => s.bootstrap);
  const rooms = useChatDataStore((s) => s.rooms);

  useEffect(() => {
    if (Object.keys(rooms).length === 0) {
      bootstrap(mockItems, mockMessages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms]); // bootstrap 제거 - 함수는 의존성 배열에 포함하지 않음
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

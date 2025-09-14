// src/pages/ChatPage/ChatPage.tsx
import styles from "./ChatPage.module.css";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/chat";

export const ChatPage = () => {
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

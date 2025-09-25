import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import styles from "./ChatPage.module.css";
import { Sidebar } from "../../../components/chat/Sidebar";
import { ChatSearch } from "../../../components/chat/ChatMobile/ChatSearch";
import { useIsNarrow } from "../../../hooks/useIsNarrow";
import { CHAT_BREAKPOINT } from "../../../constants/chat";
import { ChatMobileTopBar, Drawer } from "../../../components/chat";

export const ChatPage = () => {
  const isNarrow = useIsNarrow(CHAT_BREAKPOINT);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isNarrow) {
      setDrawerOpen(false);
    }
  }, [isNarrow]);

  return (
    <div className={styles.page} data-layout={isNarrow ? "narrow" : "wide"}>
      {isNarrow ? (
        <>
          {/* ✅ ChatHeader 위에 모바일 톱바 */}
          <ChatMobileTopBar onOpenDrawer={() => setDrawerOpen(true)} />

          {/* 메인(기존 ChatHeader/Notice/MessageList/MessageInput은 Outlet 안에서 그대로) */}
          <div className={styles.mainArea}>
            <Outlet />
          </div>

          {/* 햄버거 → 사이드바 Drawer */}
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            ariaLabel="채팅방 목록"
          >
            <Sidebar
              variant="mine"
              asDrawer
              onCloseDrawer={() => setDrawerOpen(false)}
            />
          </Drawer>
        </>
      ) : (
        // > 600px: 기존 2-페인 유지
        <div className={styles.grid}>
          <aside className={styles.sidebarArea}>
            <Sidebar variant="mine" />
          </aside>
          <main className={styles.mainArea}>
            <Outlet />
          </main>
        </div>
      )}
    </div>
  );
};

import styles from "./ChatPage.module.css";
import { ChatMobileTopBar, Drawer, Sidebar } from "../../../components/chat";
import { Outlet } from "react-router-dom";
import { CHAT_BREAKPOINT, LAYOUT_CONSTANTS } from "../../../constants";
import { useIsNarrow } from "../../../hooks/useIsNarrow";
import { useEffect, useState } from "react";

export const ChatPage = () => {
  const isNarrow = useIsNarrow(CHAT_BREAKPOINT);
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    if (!isNarrow) {
      setDrawerOpen(false);
    }
  }, [isNarrow]);
  return (
    <section
      className={styles.chatLayout}
      style={{
        height: `calc(100vh - ${LAYOUT_CONSTANTS.HEADER_HEIGHT})`,
        overflow: "hidden",
      }}
      data-layout={isNarrow ? "narrow" : "wide"}
    >
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
        <>
          <aside className={styles.sidebarArea}>
            <Sidebar
              variant="mine"
              asDrawer
              onCloseDrawer={() => setDrawerOpen(false)}
            />
          </aside>
          <main className={styles.mainArea}>
            <Outlet />
          </main>
        </>
      )}
    </section>
  );
};

// src/components/chat/ChatNotificationFab/ChatNotificationFab.tsx
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import styles from "./ChatNotificationFab.module.css";
import { useChatNotificationStore } from "../../../store";
import { ChatNotificationDropdown } from "../ChatNotificationDropdown";
import { FiBell } from "react-icons/fi";

const Bell = FiBell as React.ComponentType<{
  className?: string;
  width: number;
  height: number;
}>;

export const ChatNotificationFab = () => {
  const { pathname } = useLocation();
  const unreadCount = useChatNotificationStore((s) => s.unreadCount());
  const [open, setOpen] = useState(false);

  const isChatPage = pathname.startsWith("/chat/");
  const visible = true; //!isChatPage && unreadCount > 0;

  // 래퍼 ref (바깥 클릭 닫힘 판단에 사용)
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.fabWrapper} ref={wrapperRef}>
      {/* ⬇️ 버튼과 드롭다운의 기준점 */}
      <div className={styles.anchor}>
        <button
          type="button"
          aria-label="알림 열기"
          className={styles.fabButton}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.iconWrap}>
            <Bell width={24} height={24} />
            {unreadCount > 0 && (
              <span className={styles.badge}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </span>
        </button>

        {open && (
          <div className={styles.dropdownWrap}>
            <ChatNotificationDropdown onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

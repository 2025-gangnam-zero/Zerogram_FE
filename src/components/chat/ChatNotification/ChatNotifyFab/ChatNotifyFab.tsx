// ChatNotifyFab.tsx
import styles from "./ChatNotifyFab.module.css";
import { Bell } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useRef, useState, useLayoutEffect } from "react";
import { ChatNotifyPanel } from "../ChatNotifyPanel";
import { useChatNotify } from "../../../../providers";

export const ChatNotifyFab = () => {
  const { unreadTotal } = useChatNotify();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  // 열릴 때/윈도우 리사이즈/스크롤 시 앵커 좌표 업데이트
  useLayoutEffect(() => {
    const update = () => {
      if (!btnRef.current) return;
      setAnchorRect(btnRef.current.getBoundingClientRect());
    };
    update();
    if (!open) return;
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [open]);

  if (pathname.startsWith("/chat")) return null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={styles.fab}
        aria-label={`채팅 알림${unreadTotal ? ` ${unreadTotal}개` : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className={styles.fabIcon} aria-hidden />
        {unreadTotal > 0 && <span className={styles.badge}>{unreadTotal}</span>}
      </button>

      <ChatNotifyPanel
        open={open}
        onClose={() => setOpen(false)}
        anchorRect={anchorRect} // ✅ 버튼 좌표 전달
      />
    </>
  );
};

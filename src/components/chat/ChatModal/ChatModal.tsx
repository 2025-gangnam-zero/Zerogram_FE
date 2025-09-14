// src/pages/ChatSection/ChatModal.tsx
import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./ChatModal.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export const ChatModal = ({ open, onClose, title, children }: Props) => {
  // ChatPage 내부 포탈 루트
  const container =
    document.getElementById("chatpage-modal-root") || document.body;

  // ESC 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // onClose 제거

  if (!open) return null;
  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <button
            className={styles.iconBtn}
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    container
  );
};

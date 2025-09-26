import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Drawer.module.css";

type Props = {
  open: boolean;
  ariaLabel: string;
  onClose: () => void;
  children: React.ReactNode;
};

export const Drawer = ({ open, ariaLabel, onClose, children }: Props) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  // 포커스 저장/복귀
  useEffect(() => {
    if (open) {
      lastActiveRef.current = document.activeElement as HTMLElement | null;
    } else {
      const id = requestAnimationFrame(() => {
        lastActiveRef.current?.focus?.();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  // body 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 첫 포커스 + 검색 인풋 포커스
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const id = requestAnimationFrame(() => {
      const input = panelRef.current?.querySelector<HTMLInputElement>(
        'input[role="searchbox"], input[type="search"], input[type="text"]'
      );
      input?.focus();
      input?.select?.();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  // ✅ 언마운트하지 않음 (모션을 위해)
  const content = (
    <div
      className={styles.drawer}
      data-open={open ? "true" : "false"} // ← 여기로 상태 전달
      aria-hidden={!open}
    >
      <button
        className={styles.backdrop}
        aria-label="배경 닫기"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />
      <div
        ref={panelRef}
        className={`${styles.panel} ${styles.fromLeft}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );

  const target = document.getElementById("overlay-root") ?? document.body;
  return createPortal(content, target);
};

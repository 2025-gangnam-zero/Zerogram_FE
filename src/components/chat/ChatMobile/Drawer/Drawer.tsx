import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Drawer.module.css";

type Props = {
  open: boolean;
  ariaLabel: string;
  onClose: () => void;
  children: React.ReactNode;
};

/**
 * 모바일용 왼쪽 슬라이드 Drawer
 * - body 스크롤 잠금
 * - ESC/백드롭으로 닫기
 * - 열릴 때 패널 포커스, 닫히면 트리거(이전 포커스)로 복귀
 * - Drawer 내부에서 a[href^="/chat/"] 클릭 시 자동 닫기
 * - Portal로 body에 렌더(겹침 맥락 안전)
 */
export const Drawer = ({ open, ariaLabel, onClose, children }: Props) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  // 포커스 저장/복귀
  useEffect(() => {
    if (open) {
      lastActiveRef.current = document.activeElement as HTMLElement | null;
    } else {
      // 닫힌 후 다음 틱에 복귀 (레이아웃 안정)
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

  // 첫 포커스
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  // 포털 렌더링으로 z-index/겹침 문제 방지
  const content = (
    <div
      className={`${styles.drawer} ${open ? styles.open : ""}`}
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

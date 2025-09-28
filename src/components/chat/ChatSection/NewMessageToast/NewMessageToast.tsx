import { useEffect, useRef, useState } from "react";
import styles from "./NewMessageToast.module.css";

type Props = {
  open: boolean;
  count: number;
  onClick: () => void; // 클릭 시 하단으로 이동
  onClose: () => void; // 자동/수동 닫힘
};

export const NewMessageToast = ({ open, count, onClick, onClose }: Props) => {
  const [visible, setVisible] = useState(open);
  const timerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  // open 변화 반영
  useEffect(() => {
    setVisible(open);
  }, [open]);

  // 3초 자동 닫힘 (pause 지원)
  useEffect(() => {
    if (!visible) return;
    if (pausedRef.current) return;

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3000);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible, count, onClose]);

  const handleMouseEnter = () => {
    pausedRef.current = true;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  const handleMouseLeave = () => {
    pausedRef.current = false;
    // 재시작: visible 유지 → effect가 다시 타이머 설정
    setVisible(true);
  };

  if (!visible) return null;

  return (
    <div
      className={styles.toast}
      role="status"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <span className={styles.dot} aria-hidden />새 메시지 {count}개
      <button
        type="button"
        className={styles.close}
        aria-label="닫기"
        onClick={(e) => {
          e.stopPropagation();
          setVisible(false);
          onClose();
        }}
      >
        ✕
      </button>
    </div>
  );
};

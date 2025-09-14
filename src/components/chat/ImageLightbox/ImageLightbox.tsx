// src/pages/ChatSection/ImageLightbox.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ImageLightbox.module.css";

type Props = {
  open: boolean;
  images: string[];
  index?: number; // 시작 인덱스
  onClose: () => void;
};

export const ImageLightbox = ({ open, images, index = 0, onClose }: Props) => {
  const [cur, setCur] = useState(index);
  const container = useMemo<HTMLElement | null>(() => {
    if (typeof document === "undefined") return null;
    return document.getElementById("chatpage-modal-root") || document.body;
  }, []);

  useEffect(() => setCur(index), [index, open]);

  // 키보드: ← → ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")
        setCur((v) => (v - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setCur((v) => (v + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length, onClose]);

  // 간단 프리로드(양 옆)
  useEffect(() => {
    if (!open) return;
    const preload = (i: number) => {
      if (!images[i]) return;
      const img = new Image();
      img.referrerPolicy = "no-referrer";
      img.src = images[i];
    };
    preload((cur + 1) % images.length);
    preload((cur - 1 + images.length) % images.length);
  }, [open, cur, images]);

  if (!open || !container) return null;

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        className={`${styles.nav} ${styles.left}`}
        onClick={() => setCur((v) => (v - 1 + images.length) % images.length)}
        aria-label="이전"
      >
        ◀
      </button>

      <div className={styles.stage}>
        <img
          key={cur}
          className={styles.img}
          src={images[cur]}
          alt=""
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
          }}
        />
        <div className={styles.counter}>
          {cur + 1} / {images.length}
        </div>
        <button className={styles.close} onClick={onClose} aria-label="닫기">
          ✕
        </button>
      </div>

      <button
        className={`${styles.nav} ${styles.right}`}
        onClick={() => setCur((v) => (v + 1) % images.length)}
        aria-label="다음"
      >
        ▶
      </button>
    </div>,
    container
  );
};

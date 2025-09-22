import { useEffect, useRef } from "react";
import styles from "./Lightbox.module.css";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Attachment } from "../../../types";

const isImage = (c?: string) => !!c && c.startsWith("image/");
const isVideo = (c?: string) => !!c && c.startsWith("video/");

type Props = {
  items: Attachment[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export const Lightbox = ({ items, index, onClose, onPrev, onNext }: Props) => {
  const backdropRef = useRef<HTMLDivElement | null>(null);

  // ←/→ 탐색
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onNext, onClose]);

  // 스크롤 잠금
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  const current = items[index];

  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      className={styles.backdrop}
      ref={backdropRef}
      onMouseDown={onBackdropClick}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <button className={styles.close} onClick={onClose} aria-label="닫기">
          <X />
        </button>

        {items.length > 1 && (
          <button
            className={`${styles.nav} ${styles.left}`}
            onClick={onPrev}
            aria-label="이전"
          >
            <ChevronLeft />
          </button>
        )}
        {items.length > 1 && (
          <button
            className={`${styles.nav} ${styles.right}`}
            onClick={onNext}
            aria-label="다음"
          >
            <ChevronRight />
          </button>
        )}

        <div className={styles.viewer}>
          {isImage(current.contentType) ? (
            <img
              className={styles.media}
              src={current.fileUrl}
              alt={current.fileName ?? ""}
            />
          ) : isVideo(current.contentType) ? (
            <video
              className={styles.media}
              src={current.fileUrl}
              controls
              autoPlay
            />
          ) : null}
        </div>

        <div className={styles.footer}>
          <div className={styles.caption} title={current.fileName ?? ""}>
            {current.fileName ?? "첨부"} · {index + 1} / {items.length}
          </div>
          <a
            className={styles.download}
            href={current.fileUrl}
            download={current.fileName ?? true}
            target="_blank"
            rel="noreferrer"
          >
            <Download /> 다운로드
          </a>
        </div>
      </div>
    </div>
  );
};

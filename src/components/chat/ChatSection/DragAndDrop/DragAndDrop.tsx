import { useRef, useState } from "react";
import styles from "./DragAndDrop.module.css";

type Props = {
  children: React.ReactNode;
  onDropFiles: (files: File[]) => void;
  accept?: string[];
  disabled?: boolean;
  showOverlay?: boolean;
  className?: string;
  /** ✅ 이 영역에서 발생하는 드래그는 무시(내부 DnD용) */
  ignoreRef?: React.RefObject<HTMLElement>;
};

export const DragAndDrop = ({
  children,
  onDropFiles,
  accept,
  disabled,
  showOverlay = true,
  className,
  ignoreRef,
}: Props) => {
  const hostRef = useRef<HTMLDivElement | null>(null);

  const [fileDrag, setFileDrag] = useState(false);

  const isFileDrag = (e: React.DragEvent) => {
    const dt = e.dataTransfer;
    return (
      !!dt &&
      ((dt.items && Array.from(dt.items).some((i) => i.kind === "file")) ||
        (dt.files && dt.files.length > 0))
    );
  };

  const onDragEnter = (e: React.DragEvent) => {
    if (!isFileDrag(e)) return; // 파일이 아니면 완전 무시 (preventDefault 안 함)
    e.preventDefault();
    setFileDrag(true);
  };

  const onDragOver = (e: React.DragEvent) => {
    if (!fileDrag) return; // 파일 드래그로 확인된 상태에서만
    e.preventDefault();
  };

  const onDragLeave = (e: React.DragEvent) => {
    if (!fileDrag) return;
    e.preventDefault();
    if (!hostRef.current?.contains(e.relatedTarget as Node)) setFileDrag(false);
  };

  const onDrop = (e: React.DragEvent) => {
    if (!fileDrag) return;
    e.preventDefault();
    setFileDrag(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length) onDropFiles(files);
  };
  return (
    <div
      ref={hostRef}
      className={className}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
      {showOverlay && fileDrag && (
        <div className={styles.overlay} /* pointer-events: none 이어야 함 */>
          <div className={styles.box}>여기에 파일을 놓으면 첨부됩니다</div>
        </div>
      )}
    </div>
  );
};

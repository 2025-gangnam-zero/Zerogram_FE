import { useMemo, useRef, useState } from "react";
import styles from "./AttachmentPreviewBar.module.css";
import { PreviewItem } from "../../../../types";

type Props = {
  items: PreviewItem[]; // 최대 4개
  onRemove?: (id: string) => void; // X 버튼
  onReorder?: (next: PreviewItem[]) => void; // 드래그 후 순서 변경 결과 전달
};

export const AttachmentPreviewBar = ({ items, onRemove, onReorder }: Props) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOriginIndex = useRef<number | null>(null);

  const list = useMemo(() => items.slice(0, 4), [items]); // 안전하게 4개 제한

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    dragOriginIndex.current = idx;
    setDraggingId(list[idx].id);
    e.dataTransfer.effectAllowed = "move";
    // 파이어폭스에서 필요
    e.dataTransfer.setData("text/plain", list[idx].id);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    overIdx: number
  ) => {
    e.preventDefault(); // drop 허용
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIdx: number) => {
    e.preventDefault();
    const from = dragOriginIndex.current;
    if (from == null || from === dropIdx) {
      setDraggingId(null);
      dragOriginIndex.current = null;
      return;
    }
    const next = list.slice();
    const [moved] = next.splice(from, 1);
    next.splice(dropIdx, 0, moved);
    onReorder?.(next);
    setDraggingId(null);
    dragOriginIndex.current = null;
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    dragOriginIndex.current = null;
  };

  if (list.length === 0) return null;

  return (
    <div className={styles.bar} role="region" aria-label="첨부 미리보기">
      {list.map((p, idx) => (
        <div
          key={p.id}
          className={`${styles.item} ${
            draggingId === p.id ? styles.dragging : ""
          }`}
          draggable
          onDragStart={(e) => {
            handleDragStart(e, idx);
            e.stopPropagation();
          }}
          onDragOver={(e) => {
            handleDragOver(e, idx);
            e.stopPropagation();
          }}
          onDrop={(e) => {
            handleDrop(e, idx);
            e.stopPropagation();
          }}
          onDragEnd={handleDragEnd}
          aria-grabbed={draggingId === p.id}
        >
          {p.kind === "image" ? (
            <img className={styles.thumb} src={p.url} alt={p.name} />
          ) : p.kind === "video" ? (
            <div className={styles.file}>
              <span className={styles.badge}>VIDEO</span>
              {p.name}
            </div>
          ) : (
            <div className={styles.file}>{p.name}</div>
          )}
          <button
            type="button"
            className={styles.remove}
            aria-label={`${p.name} 제거`}
            onClick={() => onRemove?.(p.id)}
          >
            ×
          </button>
          <div className={styles.handle} aria-hidden>
            ⋮⋮
          </div>
        </div>
      ))}
    </div>
  );
};

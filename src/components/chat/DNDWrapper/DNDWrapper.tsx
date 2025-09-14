import React, {
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import styles from "./DNDWrapper.module.css";
import { useComposerStore } from "../../../store";
import { DNDPreviewModal } from "../DNDPreviewModal";
import { DroppedItem } from "../../../types";

type Props = {
  roomId: string;
  children: React.ReactNode;
};

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const DNDWrapper: React.FC<Props> = ({ roomId, children }) => {
  const addFiles = useComposerStore((s) => s.addFiles);

  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const [items, setItems] = useState<DroppedItem[]>([]);
  const [open, setOpen] = useState(false);

  const totalMB = useMemo(
    () =>
      (items.reduce((a, b) => a + b.file.size, 0) / (1024 * 1024)).toFixed(1),
    [items]
  );

  // DnD events
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    setIsDragging(true);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    const files = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
      ACCEPT.includes(f.type)
    );
    if (!files.length) return;
    setItems(
      files.map((f) => ({
        id: Math.random().toString(36).slice(2),
        file: f,
        isImage: true,
        selected: true,
      }))
    );
    setOpen(true);
  };

  const close = () => setOpen(false);
  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, selected: !it.selected } : it))
    );
  const remove = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));
  const selectAll = (on = true) =>
    setItems((prev) => prev.map((it) => ({ ...it, selected: on })));
  const cancel = () => {
    setItems([]);
    setOpen(false);
  };

  const confirm = async () => {
    const picked = items.filter((i) => i.selected).map((i) => i.file);
    if (picked.length) await addFiles(roomId, picked); // ✅ composer로 전달(압축 포함)
    cancel();
  };

  return (
    <div
      className={styles.wrapper}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}

      {isDragging && (
        <div className={styles.overlay}>
          <div className={styles.overlayBox}>
            <div className={styles.overlayTitle}>여기에 놓아 첨부</div>
            <div className={styles.overlayHint}>
              이미지 파일만 가능 (JPG/PNG/WEBP/GIF)
            </div>
          </div>
        </div>
      )}

      <DNDPreviewModal
        open={open}
        items={items}
        totalMB={totalMB}
        onClose={close}
        onToggleSelect={toggle}
        onRemove={remove}
        onSelectAll={selectAll}
        onCancel={cancel}
        onConfirm={confirm}
      />
    </div>
  );
};

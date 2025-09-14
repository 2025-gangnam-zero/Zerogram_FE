import { useComposerStore } from "../../../store";
import styles from "./ComposerAttachmentsBar.module.css";

type Props = { roomId: string };

export const ComposerAttachmentsBar = ({ roomId }: Props) => {
  const { byRoom, removeAttachment, reorderAttachments } = useComposerStore();
  const atts = byRoom[roomId]?.attachments ?? [];
  if (atts.length === 0) return null;

  // 간단 드래그 정렬
  let dragFrom = -1;
  const onDragStart = (idx: number) => (e: React.DragEvent) => {
    dragFrom = idx;
    e.dataTransfer.effectAllowed = "move";
  };
  const onDrop = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragFrom !== -1 && dragFrom !== idx)
      reorderAttachments(roomId, dragFrom, idx);
    dragFrom = -1;
  };

  const totalMB = (
    atts.reduce((a, b) => a + b.size, 0) /
    (1024 * 1024)
  ).toFixed(1);

  return (
    <div
      className={styles.wrap}
      aria-label={`첨부 ${atts.length}개, 총 ${totalMB}MB`}
    >
      {atts.map((a, i) => (
        <div
          key={a.id}
          className={styles.item}
          draggable
          onDragStart={onDragStart(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop(i)}
          title={`${a.file.name} (${(a.size / (1024 * 1024)).toFixed(1)}MB)`}
        >
          <img className={styles.thumb} src={a.previewUrl} alt={a.file.name} />
          <button
            className={styles.removeBtn}
            onClick={() => removeAttachment(roomId, a.id)}
            aria-label="첨부 제거"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

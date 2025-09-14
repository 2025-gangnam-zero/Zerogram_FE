// src/pages/ChatSection/DNDPreviewModal.tsx
import { DroppedItem } from "../../../types";
import { ChatModal } from "../ChatModal";
import styles from "./DNDPreviewModal.module.css";

type Props = {
  open: boolean;
  items: DroppedItem[];
  totalMB: string;
  onClose: () => void;
  onToggleSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onSelectAll: (on?: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export const DNDPreviewModal = ({
  open,
  items,
  totalMB,
  onClose,
  onToggleSelect,
  onRemove,
  onSelectAll,
  onCancel,
  onConfirm,
}: Props) => {
  const hasImages = items.some((i) => i.isImage);
  const hasFiles = items.some((i) => !i.isImage);

  return (
    <ChatModal open={open} onClose={onClose} title="첨부 파일 확인">
      <div className={styles.body}>
        {hasImages && (
          <>
            <div className={styles.sectionTitle}>이미지</div>
            <div className={styles.imgGrid}>
              {items
                .filter((i) => i.isImage)
                .map((it) => (
                  <label key={it.id} className={styles.imgCell}>
                    <input
                      type="checkbox"
                      checked={it.selected}
                      onChange={() => onToggleSelect(it.id)}
                    />
                    <img
                      src={it.previewUrl}
                      alt={it.file.name}
                      className={styles.thumb}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className={styles.caption}>{it.file.name}</div>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => onRemove(it.id)}
                    >
                      제거
                    </button>
                  </label>
                ))}
            </div>
          </>
        )}

        {hasFiles && (
          <>
            <div className={styles.sectionTitle}>파일</div>
            <div className={styles.fileList}>
              {items
                .filter((i) => !i.isImage)
                .map((it) => (
                  <label key={it.id} className={styles.fileRow}>
                    <input
                      type="checkbox"
                      checked={it.selected}
                      onChange={() => onToggleSelect(it.id)}
                    />
                    <span className={styles.fileName} title={it.file.name}>
                      {it.file.name}
                    </span>
                    <span className={styles.fileSize}>
                      {(it.file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => onRemove(it.id)}
                    >
                      제거
                    </button>
                  </label>
                ))}
            </div>
          </>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.left}>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={() => onSelectAll(true)}
          >
            전체 선택
          </button>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={() => onSelectAll(false)}
          >
            전체 해제
          </button>
          <div className={styles.total}>
            총 {items.length}개 / {totalMB} MB
          </div>
        </div>
        <div className={styles.right}>
          <button type="button" className={styles.ghostBtn} onClick={onCancel}>
            취소
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={onConfirm}
          >
            확인
          </button>
        </div>
      </div>
    </ChatModal>
  );
};

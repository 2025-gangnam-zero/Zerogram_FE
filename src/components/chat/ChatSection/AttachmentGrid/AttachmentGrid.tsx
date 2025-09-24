import styles from "./AttachmentGrid.module.css";
import { Attachment } from "../../../../types";

type Props = {
  items: Attachment[];
  onOpen: (index: number) => void;
};

const isImage = (c?: string) => !!c && c.startsWith("image/");
const isVideo = (c?: string) => !!c && c.startsWith("video/");

export const AttachmentGrid = ({ items, onOpen }: Props) => {
  const count = items.length;
  const layoutClass =
    count === 1
      ? styles.one
      : count === 2
      ? styles.two
      : count === 3
      ? styles.three
      : count === 4
      ? styles.four
      : styles.many;

  return (
    <div className={`${styles.grid} ${layoutClass}`}>
      {items.map((att, idx) =>
        isImage(att.contentType) ? (
          <button
            key={idx}
            type="button"
            className={`${styles.cell} ${styles.clickable}`}
            onClick={() => onOpen(idx)}
            aria-label={att.fileName ?? "image"}
          >
            <img
              className={styles.media}
              src={att.fileUrl}
              alt={att.fileName ?? ""}
            />
          </button>
        ) : isVideo(att.contentType) ? (
          <button
            key={idx}
            type="button"
            className={`${styles.cell} ${styles.clickable}`}
            onClick={() => onOpen(idx)}
            aria-label={att.fileName ?? "video"}
          >
            <video className={styles.media} src={att.fileUrl} muted />
          </button>
        ) : null
      )}
    </div>
  );
};

import { Attachment } from "../../../../types";
import styles from "./AttachmentGrid.module.css";

type Props = { items: Attachment[] };

const isImage = (c?: string) => !!c && c.startsWith("image/");
const isVideo = (c?: string) => !!c && c.startsWith("video/");

export const AttachmentGrid = ({ items }: Props) => {
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
          <a
            key={idx}
            className={styles.cell}
            href={att.fileUrl}
            target="_blank"
            rel="noreferrer"
          >
            <img
              className={styles.media}
              src={att.fileUrl}
              alt={att.fileName ?? ""}
            />
          </a>
        ) : isVideo(att.contentType) ? (
          <div key={idx} className={styles.cell}>
            <video className={styles.media} src={att.fileUrl} controls />
          </div>
        ) : null
      )}
    </div>
  );
};

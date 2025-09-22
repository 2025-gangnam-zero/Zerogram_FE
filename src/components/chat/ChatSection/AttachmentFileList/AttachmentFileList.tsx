import { Attachment } from "../../../../types";
import styles from "./AttachmentFileList.module.css";
import { File as FileIcon, Download } from "lucide-react";

type Props = { items: Attachment[] };

const toSize = (b?: number) => {
  if (!b || b <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = b,
    i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2)} ${units[i]}`;
};

export const AttachmentFileList = ({ items }: Props) => {
  return (
    <div className={styles.list}>
      {items.map((att, i) => (
        <a
          key={i}
          className={styles.item}
          href={att.fileUrl}
          download={att.fileName ?? true}
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.left}>
            <FileIcon className={styles.icon} aria-hidden />
            <div className={styles.meta}>
              <div className={styles.name} title={att.fileName ?? ""}>
                {att.fileName ?? "파일"}
              </div>
              {typeof att.size === "number" && (
                <div className={styles.size}>{toSize(att.size)}</div>
              )}
            </div>
          </div>
          <Download className={styles.dl} aria-hidden />
        </a>
      ))}
    </div>
  );
};

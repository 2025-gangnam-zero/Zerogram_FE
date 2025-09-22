import styles from "./MessageAttachments.module.css";
import { Attachment } from "../../../../types";
import { AttachmentGrid } from "../AttachmentGrid";
import { AttachmentFileList } from "../AttachmentFileList";

type Props = {
  attachments: Attachment[];
  side: "me" | "other";
};

const isImage = (c?: string) => !!c && c.startsWith("image/");
const isVideo = (c?: string) => !!c && c.startsWith("video/");

export const MessageAttachments = ({ attachments, side }: Props) => {
  const media = attachments.filter(
    (a) => isImage(a.contentType) || isVideo(a.contentType)
  );
  const files = attachments.filter(
    (a) => !isImage(a.contentType) && !isVideo(a.contentType)
  );

  return (
    <div
      className={`${styles.wrap} ${side === "me" ? styles.me : styles.other}`}
    >
      {media.length > 0 && <AttachmentGrid items={media} />}

      {files.length > 0 && <AttachmentFileList items={files} />}
    </div>
  );
};

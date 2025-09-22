import { useState, useEffect } from "react";
import styles from "./MessageAttachments.module.css";
import { Attachment } from "../../../../types";
import { AttachmentGrid } from "../AttachmentGrid";
import { AttachmentFileList } from "../AttachmentFileList";
import { Lightbox } from "../../../common/Lightbox";

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

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  // ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleOpen = (startIndex: number) => {
    setIndex(startIndex);
    setOpen(true);
  };

  const handlePrev = () =>
    setIndex((i) => (i - 1 + media.length) % media.length);

  const handleNext = () => setIndex((i) => (i + 1) % media.length);

  return (
    <div
      className={`${styles.wrap} ${side === "me" ? styles.me : styles.other}`}
    >
      {media.length > 0 && <AttachmentGrid items={media} onOpen={handleOpen} />}

      {files.length > 0 && <AttachmentFileList items={files} />}

      {open && media.length > 0 && (
        <Lightbox
          items={media}
          index={index}
          onClose={() => setOpen(false)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  );
};

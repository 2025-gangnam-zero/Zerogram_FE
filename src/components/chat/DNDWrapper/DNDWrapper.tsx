import React, { useState, useCallback, useRef } from "react";
import styles from "./DNDWrapper.module.css";
import { UploadModal } from "../UploadModal";

type Props = {
  children: React.ReactNode;
  maxFileSizeMB?: number;
};

export const DNDWrapper: React.FC<Props> = ({
  children,
  maxFileSizeMB = 5,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [showModal, setShowModal] = useState(false);
  const dragCounter = useRef(0);

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();

    dragCounter.current += 1;
    setIsDragging(true);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);

      const dropped = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );

      const validated = dropped.filter((file) => {
        if (!file.type.startsWith("image/")) return false;
        if (file.size > maxFileSizeMB * 1024 * 1024) {
          alert(`${file.name} 은(는) ${maxFileSizeMB}MB를 초과합니다.`);
          return false;
        }
        return true;
      });

      if (validated.length > 0) {
        setFiles(validated);
        setShowModal(true);
      }
    },
    [maxFileSizeMB]
  );

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
          <p>이미지를 여기에 드롭하세요</p>
        </div>
      )}

      {showModal && (
        <UploadModal files={files} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

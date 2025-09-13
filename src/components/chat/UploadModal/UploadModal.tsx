import styles from "./UploadModal.module.css";

type Props = {
  files: File[];
  onClose: () => void;
};

export const UploadModal = ({ files, onClose }: Props) => {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2>업로드할 이미지 미리보기</h2>
        <div className={styles.previewList}>
          {files.map((file) => {
            const url = URL.createObjectURL(file);
            return (
              <div key={file.name} className={styles.previewItem}>
                <img src={url} alt={file.name} />
                <p>{file.name}</p>
                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            );
          })}
        </div>
        <div className={styles.actions}>
          <button onClick={onClose}>취소</button>
          <button className={styles.confirm}>업로드</button>
        </div>
      </div>
    </div>
  );
};

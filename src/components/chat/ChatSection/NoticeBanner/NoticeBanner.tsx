import styles from "./NoticeBanner.module.css";

type Props = {
  text: string;
  sticky?: boolean; // 스크롤해도 상단 고정 여부
};

export const NoticeBanner = ({ text, sticky = true }: Props) => {
  return (
    <div
      className={`${styles.notice} ${sticky ? styles.sticky : ""}`}
      role="note"
      aria-label="공지"
    >
      <span className={styles.label}>공지</span>
      <span className={styles.text} title={text}>
        {text}
      </span>
    </div>
  );
};

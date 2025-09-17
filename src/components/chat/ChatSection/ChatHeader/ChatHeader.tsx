import styles from "./ChatHeader.module.css";
import { MoreMenu, MenuAction } from "../../../chat";

type Props = {
  title?: string;
  onAction?: (a: MenuAction) => void;
  noticeEnabled?: boolean; // ⬅️ 추가
  onToggleNotice?: () => void; // ⬅️ 추가
};

export const ChatHeader = ({
  title = "방 제목",
  onAction,
  noticeEnabled = false,
  onToggleNotice,
}: Props) => {
  return (
    <header className={styles.header}>
      <h2 className={styles.title} title={title}>
        {title}
      </h2>

      <div className={styles.tools}>
        {/* 텍스트형 토글 버튼 */}
        <button
          type="button"
          className={`${styles.noticeToggle} ${
            noticeEnabled ? styles.noticeOn : ""
          }`}
          onClick={onToggleNotice}
          aria-pressed={noticeEnabled}
        >
          공지
        </button>

        <MoreMenu onAction={onAction} />
      </div>
    </header>
  );
};

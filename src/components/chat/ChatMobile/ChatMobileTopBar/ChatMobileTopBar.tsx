import styles from "./ChatMobileTopBar.module.css";
import { Menu, Search } from "lucide-react";

type Props = {
  onOpenDrawer: () => void;
};

export const ChatMobileTopBar = ({ onOpenDrawer }: Props) => {
  return (
    <div className={styles.topbar} role="banner">
      <button
        className={styles.iconBtn}
        aria-label="목록 열기"
        onClick={onOpenDrawer}
      >
        <Menu className={styles.icon} aria-hidden />
      </button>
      <div className={styles.center}>
        <span className={styles.title}>채팅</span>
      </div>
    </div>
  );
};

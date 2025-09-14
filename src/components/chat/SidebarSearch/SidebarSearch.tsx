import styles from "./SidebarSearch.module.css";
import { FiSearch } from "react-icons/fi";

export const SidebarSearch = () => {
  const Icon = FiSearch as React.ComponentType<{ className?: string }>;

  return (
    <div className={styles.wrap}>
      <Icon className={styles.icon} aria-hidden="true" />
      <input
        className={styles.input}
        type="text"
        placeholder="채팅방 검색"
        aria-label="채팅방 검색"
      />
    </div>
  );
};

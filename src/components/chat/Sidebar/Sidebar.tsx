// src/components/chat/Sidebar.tsx
import styles from "./Sidebar.module.css";
import { SidebarList, SidebarSearch } from "../../../components/chat";

export const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.searchArea}>
        <SidebarSearch />
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.listArea}>
        <SidebarList />
      </div>
    </div>
  );
};

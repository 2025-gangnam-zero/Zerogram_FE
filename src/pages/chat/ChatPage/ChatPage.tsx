import styles from "./ChatPage.module.css";
import { Sidebar } from "../../../components/chat";
import { Outlet } from "react-router-dom";
import { LAYOUT_CONSTANTS } from "../../../constants";

export const ChatPage = () => {
  return (
    <section
      className={styles.chatLayout}
      style={{
        height: `calc(100vh - ${LAYOUT_CONSTANTS.HEADER_HEIGHT})`,
        overflow: "hidden",
      }}
    >
      <aside className={styles.sidebarArea}>
        <Sidebar />
      </aside>
      <main className={styles.mainArea}>
        <Outlet />
      </main>
    </section>
  );
};

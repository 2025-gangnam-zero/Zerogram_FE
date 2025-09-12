import styles from "./ChatPage.module.css";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/chat";

const ChatPage = () => {
  return (
    <div className={styles["chatpage"]}>
      <Sidebar />
      <main className={styles["main"]}>
        <Outlet />
      </main>
    </div>
  );
};

export default ChatPage;

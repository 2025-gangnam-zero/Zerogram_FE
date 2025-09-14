import styles from "./SidebarList.module.css";
import { SidebarListItem } from "../SidebarListItem";
import { mockItems } from "../../../data/chat.mock";

export const SidebarList = () => {
  return (
    <div className={styles.wrap} role="list" aria-label="채팅방 목록">
      {mockItems.map((item) => (
        <SidebarListItem key={item.id} item={item} />
      ))}
    </div>
  );
};

import styles from "./SidebarList.module.css";
import { useParams } from "react-router-dom";
import { SidebarItem } from "../../../chat";
import { SidebarListItemData } from "../../../../types";

type Props = {
  items: SidebarListItemData[];
};

export const SidebarList = ({ items }: Props) => {
  const { roomid } = useParams();
  return (
    <div className={styles.wrap}>
      <ul className={styles.list} role="list">
        {items.map((it) => (
          <SidebarItem key={it.id} item={it} selected={roomid === it.id} />
        ))}
      </ul>
    </div>
  );
};

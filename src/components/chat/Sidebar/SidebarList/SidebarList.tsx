import styles from "./SidebarList.module.css";
import { useParams } from "react-router-dom";
import { SidebarItem, SidebarVariant } from "../../../chat";
import { SidebarListItemData } from "../../../../types";

type Props = {
  items: SidebarListItemData[];
  variant: SidebarVariant; // ← 추가
};

export const SidebarList = ({ items, variant }: Props) => {
  const { roomid } = useParams();
  return (
    <div className={styles.wrap}>
      <ul className={styles.list} role="list">
        {items.map((it) => (
          <SidebarItem
            key={it.id}
            item={it}
            selected={roomid === it.id}
            variant={variant}
          />
        ))}
      </ul>
    </div>
  );
};

import styles from "./SidebarList.module.css";
import { SidebarItem } from "../SidebarItem";
import { SidebarListItemData } from "../../../../types";

type Props = {
  items: SidebarListItemData[];
  variant: "mine" | "public";
  onSelectRoom?: (roomId: string) => void; // 드로어 닫기 신호 전달용(선택)
};

export const SidebarList = ({ items, variant, onSelectRoom }: Props) => {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        // ⚠️ SidebarItem이 루트 li를 반환하므로, 여기서 li로 다시 감싸지 않습니다.
        <SidebarItem
          key={item.id}
          item={item}
          variant={variant}
          onSelect={onSelectRoom}
        />
      ))}
    </ul>
  );
};

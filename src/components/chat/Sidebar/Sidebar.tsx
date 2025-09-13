import { CHAT_SIDEBAR_TITLE } from "../../../constants";
import { CHThread } from "../../../types";
import { CRItem } from "../CRItem";
import styles from "./Sidebar.module.css";

type Props = {
  crs: CHThread[];
  activeId?: string;
  onSelect: (id: string) => void;
};

export const Sidebar = ({ crs, activeId, onSelect }: Props) => {
  console.log(crs);
  console.log(activeId);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>{CHAT_SIDEBAR_TITLE}</div>
      <nav className={styles.list}>
        {crs.map((cr) => (
          <CRItem
            key={cr.id}
            cr={cr}
            active={cr.id === activeId}
            onClick={() => onSelect(cr.id)}
          />
        ))}
      </nav>
    </aside>
  );
};

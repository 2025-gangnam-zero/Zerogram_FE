import { useMemo, useState } from "react";
import styles from "./Sidebar.module.css";
import {
  SidebarTabs,
  SidebarTabKey,
  SidebarList,
  SearchBar,
} from "../../../chat";
import { mineRooms, publicRooms } from "../../../../data/chat";

export const Sidebar = () => {
  const [tab, setTab] = useState<SidebarTabKey>("mine");
  const [query, setQuery] = useState("");

  const fullMineCount = mineRooms.length;
  const fullPublicCount = publicRooms.length;

  const filtered = useMemo(() => {
    const src = tab === "mine" ? mineRooms : publicRooms;
    const q = query.trim().toLowerCase();
    if (!q) return src;
    return src.filter((r) => r.roomName.toLowerCase().includes(q));
  }, [tab, query]);

  return (
    <div className={styles.sidebar}>
      <SearchBar onChange={setQuery} onSubmit={setQuery} />
      <SidebarTabs
        value={tab}
        onChange={setTab}
        mineCount={fullMineCount}
        publicCount={fullPublicCount}
      />
      <div className={styles.listArea}>
        <SidebarList
          items={filtered}
          variant={tab === "mine" ? "mine" : "public"}
        />
      </div>
    </div>
  );
};

import { useId } from "react";
import styles from "./SidebarTabs.module.css";

export type SidebarTabKey = "mine" | "public";

type Props = {
  value: SidebarTabKey;
  onChange: (v: SidebarTabKey) => void;
  mineCount?: number; // 선택: 배지
  publicCount?: number; // 선택: 배지
};

export const SidebarTabs = ({
  value,
  onChange,
  mineCount,
  publicCount,
}: Props) => {
  const id = useId();
  return (
    <div className={styles.tabs} role="tablist" aria-label="채팅방 목록 탭">
      <button
        id={`${id}-mine`}
        className={`${styles.tab} ${value === "mine" ? styles.active : ""}`}
        role="tab"
        aria-selected={value === "mine"}
        aria-controls={`${id}-panel-mine`}
        onClick={() => onChange("mine")}
        type="button"
      >
        내 채팅
        {typeof mineCount === "number" && (
          <span className={styles.badge}>{mineCount}</span>
        )}
      </button>

      <button
        id={`${id}-public`}
        className={`${styles.tab} ${value === "public" ? styles.active : ""}`}
        role="tab"
        aria-selected={value === "public"}
        aria-controls={`${id}-panel-public`}
        onClick={() => onChange("public")}
        type="button"
      >
        공개
        {typeof publicCount === "number" && (
          <span className={styles.badge}>{publicCount}</span>
        )}
      </button>
    </div>
  );
};

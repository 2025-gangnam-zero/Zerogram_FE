import { useEffect, useId, useRef, useState } from "react";
import styles from "./MoreMenu.module.css";
import { MoreVertical, Info, UserPlus, BellOff, LogOut } from "lucide-react";

export type MenuAction = "info" | "invite" | "mute" | "leave";
export type MenuItem = {
  key: MenuAction;
  label: string;
  danger?: boolean;
};

type Props = {
  onAction?: (a: MenuAction) => void;
  items?: MenuItem[]; // 커스터마이즈 가능. 없으면 기본 메뉴 사용
  className?: string; // 필요 시 헤더 우측 정렬 컨테이너에 스타일 추가
};

const DEFAULT_ITEMS: MenuItem[] = [
  // { key: "info", label: "방 정보" },
  // { key: "invite", label: "멤버 초대" },
  // { key: "mute", label: "알림 끄기" },
  { key: "leave", label: "나가기", danger: true },
];

export function MoreMenu({
  onAction,
  items = DEFAULT_ITEMS,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 바깥 클릭 / ESC 닫기
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handle = (a: MenuAction) => {
    setOpen(false);
    onAction?.(a);
  };

  const renderIcon = (key: MenuAction) => {
    switch (key) {
      case "info":
        return <Info className={styles.menuIcon} aria-hidden />;
      case "invite":
        return <UserPlus className={styles.menuIcon} aria-hidden />;
      case "mute":
        return <BellOff className={styles.menuIcon} aria-hidden />;
      case "leave":
        return <LogOut className={styles.menuIcon} aria-hidden />;
    }
  };

  return (
    <div className={`${styles.root} ${className ?? ""}`}>
      <button
        ref={btnRef}
        type="button"
        className={styles.moreBtn}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        onClick={() => setOpen((v) => !v)}
        title="더보기"
      >
        <MoreVertical className={styles.moreIcon} aria-hidden />
      </button>

      {open && (
        <div
          id={`${id}-menu`}
          ref={menuRef}
          className={styles.menu}
          role="menu"
        >
          {items.map((it) => (
            <button
              key={it.key}
              className={`${styles.menuItem} ${it.danger ? styles.danger : ""}`}
              role="menuitem"
              onClick={() => handle(it.key)}
            >
              {renderIcon(it.key)} {it.label}
            </button>
          ))}
          {/* 목록 추가 시 변경할 것  */}
          {/* {items.slice(0, 3).map((it) => (
            <button
              key={it.key}
              className={styles.menuItem}
              role="menuitem"
              onClick={() => handle(it.key)}
            >
              {renderIcon(it.key)} {it.label}
            </button>
          ))}
          <hr className={styles.sep} />
          {items.slice(3).map((it) => (
            <button
              key={it.key}
              className={`${styles.menuItem} ${it.danger ? styles.danger : ""}`}
              role="menuitem"
              onClick={() => handle(it.key)}
            >
              {renderIcon(it.key)} {it.label}
            </button>
          ))} */}
        </div>
      )}
    </div>
  );
}

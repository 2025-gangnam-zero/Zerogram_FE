import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ChatNotificationDropdown.module.css";
import { useChatNotificationStore } from "../../../store";
import { FiCheck, FiExternalLink, FiTrash2 } from "react-icons/fi";

const Check = FiCheck as React.ComponentType<{
  className?: string;
  width: number;
  height: number;
}>;
const ExternalLink = FiExternalLink as React.ComponentType<{
  className?: string;
  width: number;
  height: number;
}>;
const Trash2 = FiTrash2 as React.ComponentType<{
  className?: string;
  width: number;
  height: number;
}>;

function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null> | React.MutableRefObject<T | null>,
  handler: () => void
) {
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = ref.current;
      if (!el || el.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [ref, handler]);
}

function fmt(ts: number) {
  return new Date(ts).toLocaleString();
}

export function ChatNotificationDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const items = useChatNotificationStore((s) => s.items);
  const markRead = useChatNotificationStore((s) => s.markRead);
  const markAllRead = useChatNotificationStore((s) => s.markAllRead);
  const remove = useChatNotificationStore((s) => s.remove);
  const navigate = useNavigate();

  useClickOutside(ref, onClose);

  const go = async (id: string, url?: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      markRead(id);
    } catch {}
    if (url) navigate(url);
    onClose();
  };

  const readAll = async () => {
    try {
      await fetch(`/api/notifications/read-all`, {
        method: "PATCH",
        credentials: "include",
      });
      markAllRead();
    } catch {}
  };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="알림 목록"
      className={styles.panel}
    >
      <div className={styles.header}>
        <span>알림</span>
        <button onClick={readAll} className={styles.headerBtn}>
          <Check width={16} height={16} /> 모두 읽음
        </button>
      </div>

      <ul className={styles.list}>
        {items.length === 0 && (
          <li className={styles.empty}>알림이 없습니다.</li>
        )}

        {items.map((n) => (
          <li key={n.id} className={styles.item}>
            <button className={styles.itemBtn} onClick={() => go(n.id, n.url)}>
              <img
                src={n.roomThumbnail || "https://placehold.co/40x40?text=R"}
                alt=""
                className={styles.thumb}
              />
              <div className={styles.body}>
                <div className={styles.titleRow}>
                  <p
                    className={`${styles.title} ${
                      n.read ? styles.titleRead : ""
                    }`}
                  >
                    {n.title}
                  </p>
                  {!n.read && <span className={styles.unreadDot} />}
                </div>
                <p className={styles.message}>{n.messageContent}</p>
                <p className={styles.time}>{fmt(n.createdAt)}</p>
              </div>
            </button>
            <div className={styles.actions}>
              {n.url && (
                <a href={n.url} className={styles.linkBtn}>
                  이동 <ExternalLink width={12} height={12} />
                </a>
              )}
              <button onClick={() => remove(n.id)} className={styles.deleteBtn}>
                삭제 <Trash2 width={12} height={12} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

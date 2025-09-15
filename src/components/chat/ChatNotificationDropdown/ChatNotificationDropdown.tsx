import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ChatNotificationDropdown.module.css";
import { useChatNotificationStore, useRoomsStore } from "../../../store";
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

// ✅ 서버 ISO 문자열 대응
function fmtIso(iso?: string) {
  if (!iso) return "";
  const t = Date.parse(iso);
  return Number.isFinite(t) ? new Date(t).toLocaleString() : "";
}

export function ChatNotificationDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const items = useChatNotificationStore((s) => s.items);
  const markRoomRead = useChatNotificationStore((s) => s.markRoomRead);
  const clearRoom = useChatNotificationStore((s) => s.clearRoom);
  const totalUnreadCount = useChatNotificationStore((s) => s.totalUnreadCount);
  const navigate = useNavigate();

  // 방 메타(이름/썸네일) 보조 조회
  const getRoomMeta = (roomId: string) => {
    const room = useRoomsStore.getState().byId[roomId];
    return {
      name: room?.roomName ?? `방 ${roomId.slice(-4)}`,
      thumb: room?.roomImageUrl || "https://placehold.co/40x40?text=R",
      url: `/chat/${roomId}`, // 필요 시 라우팅 규칙에 맞게 수정
    };
  };

  useClickOutside(ref, onClose);

  // ✅ 단건 이동 + 읽음 처리 (room 단위)
  const go = async (roomId: string, url?: string) => {
    try {
      // 서버 API 예시: 실제 라우트에 맞게 조정
      await fetch(`/api/chatnotifications/rooms/${roomId}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      markRoomRead(roomId);
    } catch {
      // 네트워크 에러 시에도 클라 낙관적 갱신을 유지할지 정책에 따라 결정
      markRoomRead(roomId);
    }
    if (url) navigate(url);
    onClose();
  };

  // ✅ 전체 읽음 (roomId별로 처리)
  const readAll = async () => {
    try {
      await fetch(`/api/chatnotifications/read-all`, {
        method: "PATCH",
        credentials: "include",
      });
      // 서버에서 일괄 처리되더라도, 클라도 낙관적으로 모두 0 처리
      items.forEach((n) => markRoomRead(n.roomId));
    } catch {
      items.forEach((n) => markRoomRead(n.roomId));
    }
  };

  // ✅ 항목 삭제(알림 제거)
  const removeOne = async (roomId: string) => {
    try {
      await fetch(`/api/chatnotifications/rooms/${roomId}`, {
        method: "DELETE",
        credentials: "include",
      });
      clearRoom(roomId, true);
    } catch {
      clearRoom(roomId, true);
    }
  };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="알림 목록"
      className={styles.panel}
    >
      <div className={styles.header}>
        <span>
          알림 {totalUnreadCount() > 0 ? `(${totalUnreadCount()})` : ""}
        </span>
        <button onClick={readAll} className={styles.headerBtn}>
          <Check width={16} height={16} /> 모두 읽음
        </button>
      </div>

      <ul className={styles.list}>
        {items.length === 0 && (
          <li className={styles.empty}>알림이 없습니다.</li>
        )}

        {items.map((n) => {
          const meta = getRoomMeta(n.roomId);
          const unread = (n.count ?? 0) > 0;

          return (
            <li key={n.id} className={styles.item}>
              <button
                className={styles.itemBtn}
                onClick={() => go(n.roomId, meta.url)}
              >
                <img src={meta.thumb} alt="" className={styles.thumb} />
                <div className={styles.body}>
                  <div className={styles.titleRow}>
                    {/* ✅ title → roomName로 대체 */}
                    <p
                      className={`${styles.title} ${
                        !unread ? styles.titleRead : ""
                      }`}
                    >
                      {meta.name}
                    </p>
                    {unread && <span className={styles.unreadDot} />}
                  </div>

                  {/* ✅ messageContent → lastPreview로 변경 (없으면 기본 문구) */}
                  <p className={styles.message}>
                    {n.lastPreview ?? "새 메시지가 있습니다."}
                  </p>

                  {/* ✅ createdAt → updatedAt(최근 갱신) 표시가 더 직관적 */}
                  <p className={styles.time}>
                    {fmtIso(n.updatedAt || n.createdAt)}
                  </p>
                </div>
              </button>

              <div className={styles.actions}>
                <a href={meta.url} className={styles.linkBtn}>
                  이동 <ExternalLink width={12} height={12} />
                </a>
                <button
                  onClick={() => removeOne(n.roomId)}
                  className={styles.deleteBtn}
                >
                  삭제 <Trash2 width={12} height={12} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

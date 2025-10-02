// ChatNotifyPanel.tsx
import styles from "./ChatNotifyPanel.module.css";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useChatNotify } from "../../../../providers";
import { formatTimeKo } from "../../../../utils";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorRect: DOMRect | null;
};

export const ChatNotifyPanel = ({ open, onClose, anchorRect }: Props) => {
  const { items, markRoomRead } = useChatNotify();

  const unreadItems = items.filter((it) => Number(it.unread > 0));
  const target = document.getElementById("overlay-root") ?? document.body;
  if (!open || !anchorRect) return null;

  // 배치 계산
  const GAP = 10;
  const PADDING = 8;
  const PANEL_W = 360;
  const left = Math.min(
    window.innerWidth - PANEL_W - PADDING,
    Math.max(PADDING, anchorRect.right - PANEL_W)
  );
  const bottom = window.innerHeight - anchorRect.top + GAP;
  const maxHeight = Math.max(220, anchorRect.top - GAP - PADDING);

  return createPortal(
    <>
      <div className={styles.popoverBackdrop} onClick={onClose} />

      <div
        className={styles.popoverPanel}
        role="dialog"
        aria-modal="true"
        aria-label="채팅 알림"
        style={{ left, bottom, maxHeight, width: PANEL_W }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.popoverHeader}>
          <strong className={styles.headerTitle}>채팅 알림</strong>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="닫기"
          >
            닫기
          </button>
        </div>

        <ul className={styles.popoverList}>
          {unreadItems.length === 0 && (
            <li className={styles.empty}>읽지 않은 알림이 없습니다.</li>
          )}

          {unreadItems.map((it) => (
            <li key={it.roomId} className={styles.row}>
              <Link
                to={`/chat/${it.roomId}`}
                className={styles.rowLink}
                onClick={() => {
                  markRoomRead(it.roomId);
                  onClose();
                }}
              >
                {/* 상단: 방 제목 · 시간 · unread */}
                <div className={styles.rowTop}>
                  <span className={styles.roomName} title={it.roomName ?? ""}>
                    {it.roomName ?? "채팅방"}
                  </span>

                  <div className={styles.topRight}>
                    {it.lastMessageAt && (
                      <time
                        className={styles.time}
                        title={it.lastMessageAt}
                        dateTime={it.lastMessageAt}
                      >
                        {formatTimeKo(it.lastMessageAt)}
                      </time>
                    )}
                    {it.unread > 0 && (
                      <span className={styles.badge}>
                        {it.unread > 99 ? "99+" : it.unread}
                      </span>
                    )}
                  </div>
                </div>

                {/* 하단: 마지막 메시지 한 줄 요약 */}
                <div className={styles.rowBottom}>
                  <span className={styles.snippet} title={it.lastMessage ?? ""}>
                    {it.lastMessage ?? ""}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* 말풍선 꼬리 */}
        <div
          className={styles.arrow}
          style={{
            right: Math.max(
              12,
              Math.min(PANEL_W - 24, PANEL_W - anchorRect.width / 2)
            ),
          }}
        />
      </div>
    </>,
    target
  );
};

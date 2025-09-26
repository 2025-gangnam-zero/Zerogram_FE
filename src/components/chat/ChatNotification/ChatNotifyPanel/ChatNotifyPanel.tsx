// ChatNotifyPanel.tsx
import styles from "./ChatNotifyPanel.module.css";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useChatNotify } from "../../../../providers";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorRect: DOMRect | null; // ✅ 추가
};

export const ChatNotifyPanel = ({ open, onClose, anchorRect }: Props) => {
  const { items, markRoomRead } = useChatNotify();
  const target = document.getElementById("overlay-root") ?? document.body;
  if (!open || !anchorRect) return null;

  // 배치 계산: 버튼 바로 위·우측 정렬
  const GAP = 10; // 버튼과 패널 사이 간격
  const PADDING = 8; // 화면 여백
  const PANEL_W = 360; // 패널 기본 폭(원하면 CSS에서 width: auto로 바꾸고 여기 계산 제거)
  const left = Math.min(
    window.innerWidth - PANEL_W - PADDING,
    Math.max(PADDING, anchorRect.right - PANEL_W)
  );
  const bottom = window.innerHeight - anchorRect.top + GAP;

  // 상단 여유만큼 패널 최대 높이 제한 (헤더 포함)
  const maxHeight = Math.max(180, anchorRect.top - GAP - PADDING); // 최소 180px 보장

  return createPortal(
    <>
      {/* 백드롭(클릭 시 닫기) */}
      <div className={styles.popoverBackdrop} onClick={onClose} />

      {/* 고정 위치 패널 */}
      <div
        className={styles.popoverPanel}
        role="dialog"
        aria-modal="true"
        aria-label="채팅 알림"
        style={{
          left,
          bottom, // ✅ 버튼 위에 붙이기
          maxHeight, // ✅ 길어지면 내부 스크롤
          width: PANEL_W, // 필요 시 제거하고 CSS로 제어
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.popoverHeader}>
          <strong>채팅 알림</strong>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="닫기"
          >
            닫기
          </button>
        </div>

        <ul className={styles.popoverList}>
          {items.length === 0 && (
            <li className={styles.empty}>읽지 않은 알림이 없습니다.</li>
          )}
          {items.map((item) => (
            <li key={item.roomId} className={styles.row}>
              <Link
                to={`/chat/${item.roomId}`}
                className={styles.rowLink}
                onClick={() => {
                  markRoomRead(item.roomId);
                  onClose();
                }}
              >
                <div className={styles.rowTitle}>
                  <span className={styles.roomName}>
                    {item.roomName ?? "채팅방"}
                  </span>
                  {item.unread > 0 && (
                    <span className={styles.rowBadge}>{item.unread}</span>
                  )}
                </div>
                <div className={styles.rowMeta}>
                  <span className={styles.snippet}>
                    {item.lastMessage ?? ""}
                  </span>
                  {item.lastMessageAt && (
                    <time className={styles.at}>{item.lastMessageAt}</time>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* 선택: 말풍선 꼬리 */}
        <div
          className={styles.arrow}
          style={{
            // 버튼 오른쪽 정렬 기준으로 살짝 안쪽에
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

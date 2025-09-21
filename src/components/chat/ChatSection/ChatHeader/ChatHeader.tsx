// ChatHeader.tsx
import { useState } from "react";
import styles from "./ChatHeader.module.css";
import type { RoomNotice } from "../../../../types";
import { NoticeManageModal } from "../NoticeManageModal";

type Props = {
  roomId: string;
  title?: string;
  // 기존 props
  noticeEnabled?: boolean;
  onToggleNotice?: () => void;
  // 권한/데이터
  canManageNotice?: boolean; // owner/admin이면 true
  notice?: RoomNotice | null;
  onNoticeUpdated?: (next: RoomNotice | null) => void; // 저장/삭제 후 호출
};

export const ChatHeader = ({
  roomId,
  title,
  noticeEnabled,
  onToggleNotice,
  canManageNotice = false,
  notice = null,
  onNoticeUpdated,
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <h2 className={styles.title}>{title ?? "채팅"}</h2>

      <div className={styles.tools}>
        {/* 일반 참여자: 공지 표시 토글 (보기/숨기기) */}
        <button
          type="button"
          className={styles.noticeToggleBtn}
          aria-pressed={!!noticeEnabled}
          onClick={onToggleNotice}
          title={noticeEnabled ? "공지 숨기기" : "공지 보기"}
        >
          공지
        </button>

        {/* 관리자(Owner/Admin): 공지 관리 버튼 */}
        {canManageNotice && (
          <>
            <button
              type="button"
              className={styles.noticeManageBtn}
              onClick={() => setOpen(true)}
              title="공지 작성/수정/삭제"
            >
              공지 관리
            </button>

            {open && (
              <NoticeManageModal
                roomId={roomId}
                initialNotice={notice}
                onClose={() => setOpen(false)}
                onUpdated={(next) => {
                  onNoticeUpdated?.(next);
                  setOpen(false);
                }}
              />
            )}
          </>
        )}
      </div>
    </header>
  );
};

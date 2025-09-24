// NoticeManageModal.tsx
import { useEffect, useState } from "react";
import styles from "./NoticeManageModal.module.css";
import type { RoomNotice } from "../../../../types";
import { deleteRoomNoticeApi, updateRoomNoticeApi } from "../../../../api/chat";

type Props = {
  roomId: string;
  initialNotice: RoomNotice | null | undefined;
  onClose: () => void;
  onUpdated: (next: RoomNotice | null) => void;
};

export const NoticeManageModal = ({
  roomId,
  initialNotice,
  onClose,
  onUpdated,
}: Props) => {
  const [text, setText] = useState(initialNotice?.text ?? "");
  const [enabled, setEnabled] = useState<boolean>(!!initialNotice?.enabled);
  const [busy, setBusy] = useState(false);
  const hasNotice = !!initialNotice?.enabled && !!initialNotice?.text;

  useEffect(() => {
    setText(initialNotice?.text ?? "");
    setEnabled(!!initialNotice?.enabled);
  }, [initialNotice]);

  const handleSave = async () => {
    if (enabled && !text.trim()) {
      alert("공지 내용은 비어 있을 수 없습니다.");
      return;
    }
    try {
      setBusy(true);
      // 생성/수정 겸용
      const res = await updateRoomNoticeApi(roomId, { text, enabled });
      // 서버 응답 포맷에 따라 최신 notice가 함께 오지 않는다면
      // 저장 후 클라에서 즉시 반영:
      const next: RoomNotice | null = enabled
        ? {
            text: text.trim(),
            enabled: true,
            updatedAt: new Date().toISOString(),
          }
        : {
            text: text.trim(),
            enabled: false,
            updatedAt: new Date().toISOString(),
          };
      onUpdated(next);
    } catch (e: any) {
      alert(e?.message ?? "공지 저장 실패");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 공지를 삭제하시겠습니까?")) return;
    try {
      setBusy(true);
      await deleteRoomNoticeApi(roomId);
      onUpdated({
        text: undefined,
        enabled: false,
        updatedAt: new Date().toISOString(),
      });
    } catch (e: any) {
      alert(e?.message ?? "공지 삭제 실패");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label="공지 관리"
    >
      <div className={styles.modal}>
        <header className={styles.header}>
          <h3>공지 관리</h3>
        </header>

        <div className={styles.body}>
          <label className={styles.row}>
            <span className={styles.label}>활성화</span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              disabled={busy}
            />
          </label>

          <label className={styles.rowColumn}>
            <span className={styles.label}>내용</span>
            <textarea
              className={styles.textarea}
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="공지 내용을 입력하세요"
              disabled={busy}
            />
          </label>
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={busy}
          >
            닫기
          </button>
          {hasNotice && (
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={handleDelete}
              disabled={busy}
            >
              삭제
            </button>
          )}
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={busy}
          >
            저장
          </button>
        </footer>
      </div>
    </div>
  );
};

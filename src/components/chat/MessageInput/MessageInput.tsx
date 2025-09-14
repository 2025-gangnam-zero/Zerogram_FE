import { useEffect, useRef, useState } from "react";
import styles from "./MessageInput.module.css";
import { useParams } from "react-router-dom";
import { useComposerStore, useMessagesStore } from "../../../store";
import { ChatMessage } from "../../../types";

// 간단 시간 포맷
const fmtTime = (d = new Date()) => {
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const isAM = h < 12;
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${isAM ? "오전" : "오후"} ${hh}:${m}`;
};

const MAX_LEN = 250;

export const MessageInput = () => {
  const { roomId } = useParams();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const composer = useComposerStore((s) =>
    roomId ? s.byRoom[roomId] : undefined
  );
  const ensureRoom = useComposerStore((s) => s.ensureRoom);
  const setText = useComposerStore((s) => s.setText);
  const setPendingSend = useComposerStore((s) => s.setPendingSend);
  const clear = useComposerStore((s) => s.clear);

  const addMessage = useMessagesStore((s) => s.addMessage);

  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    if (roomId) ensureRoom(roomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]); // ensureRoom 제거 - 함수는 의존성 배열에 포함하지 않음

  const value = composer?.text ?? "";
  const attachments = composer?.attachments ?? [];
  const isEmpty = value.trim().length === 0 && attachments.length === 0;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]); // autoResize 함수 제거하고 직접 실행

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!roomId) return;

    const next = e.target.value;
    if (next.length > MAX_LEN) return; // 초과 차단
    setText(roomId, next);
  };

  const sendNow = () => {
    if (isEmpty || !roomId) return;

    const msg: ChatMessage = {
      id: `tmp-${Date.now()}`,
      roomId,
      author: {
        id: "me",
        name: "나",
        avatarUrl: "https://placehold.co/32x32/000000/FFFFFF?text=ME",
      },
      content: value.trim() || undefined,
      images: attachments.length
        ? attachments.map((a) => a.previewUrl)
        : undefined,
      createdAt: fmtTime(),
      isMine: true,
      unreadByCount: 0,
    };
    addMessage(roomId, msg);
    clear(roomId); // 입력/첨부 초기화
    // 포커스 유지
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!roomId) return;

    if (e.key === "Enter" && !e.shiftKey) {
      // IME 조합 중 Enter도 전송: composition 상태에 따라 처리
      if (isComposing) {
        e.preventDefault();
        setPendingSend(roomId, true);
        return;
      }
      e.preventDefault();
      sendNow();
    }
  };

  const onCompositionStart = () => {
    setIsComposing(true);
  };
  const onCompositionEnd = () => {
    if (!roomId) return;

    setIsComposing(false);
    if (composer?.pendingSend) {
      setPendingSend(roomId, false);
      sendNow();
    }
  };

  if (!roomId || !composer) return null;
  return (
    <form
      className={styles.wrap}
      onSubmit={(e) => {
        e.preventDefault();
        sendNow();
      }}
    >
      {/* 프리뷰 바 (첨부가 있을 때) */}
      {attachments.length > 0 && (
        <div className={styles.previewBar}>
          {/* 별도 컴포넌트로 분리해도 되지만 의존 줄이기 위해 간단 표현 */}
          {attachments.map((a) => (
            <div key={a.id} className={styles.previewItem} title={a.file.name}>
              <img
                src={a.previewUrl}
                alt={a.file.name}
                className={styles.previewImg}
              />
            </div>
          ))}
        </div>
      )}

      <div className={styles.inputRow}>
        <div className={styles.textareaWrap}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={value}
            placeholder={`메시지를 입력하세요 (최대 ${MAX_LEN}자, Enter: 전송 / Shift+Enter: 줄바꿈)`}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onCompositionStart={onCompositionStart}
            onCompositionEnd={onCompositionEnd}
            rows={1}
            aria-label="메시지 입력"
          />

          <div className={styles.counterIn} aria-live="polite" role="status">
            {value.length}/{MAX_LEN}
          </div>
        </div>
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={isEmpty}
          aria-disabled={isEmpty}
        >
          보내기
        </button>
      </div>
    </form>
  );
};

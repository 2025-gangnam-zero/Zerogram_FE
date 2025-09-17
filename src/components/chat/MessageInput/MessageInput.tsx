import { useEffect, useRef, useState } from "react";
import styles from "./MessageInput.module.css";
import { useParams } from "react-router-dom";
import { useComposerStore, useMessagesStore } from "../../../store";
import type { ChatMessage, ChatAttachment } from "../../../types";
import { sendMessage } from "../../../utils";

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
  }, [roomId]);

  const value = composer?.text ?? "";
  const attachments = composer?.attachments ?? [];
  const isEmpty = value.trim().length === 0 && attachments.length === 0;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!roomId) return;
    const next = e.target.value;
    if (next.length > MAX_LEN) return;
    setText(roomId, next);
  };

  const sendNow = async () => {
    if (isEmpty || !roomId) return;

    const clientMessageId = `cid-${Date.now()}`;

    // 방의 현재 마지막 seq를 가져와 임시 seq를 결정(정렬이 맨 뒤로 가도록)
    const { byRoomId } = useMessagesStore.getState();
    const lastSeq =
      byRoomId[roomId]?.items?.[byRoomId[roomId].items.length - 1]?.seq ?? 0;
    const tempSeq = lastSeq + 1;

    // 낙관적 첨부: previewUrl을 url로 매핑
    const optimisticAttachments: ChatAttachment[] =
      attachments.length > 0
        ? attachments.map((a) => ({
            kind: "image",
            url: a.previewUrl,
            mimeType: a.mime,
            size: a.size,
            width: a.width,
            height: a.height,
            originalName: a.file.name,
            thumbUrl: a.previewUrl,
          }))
        : [];

    const hasImages = optimisticAttachments.length > 0;
    const trimmed = value.trim();

    const msg: ChatMessage = {
      id: clientMessageId,
      clientMessageId,
      roomId,
      seq: tempSeq,
      author: {
        id: "me",
        name: "나",
        avatarUrl: "https://placehold.co/32x32/000000/FFFFFF?text=ME",
      },
      type: hasImages ? "image" : "text",
      content: trimmed || null,
      attachments: hasImages ? optimisticAttachments : undefined,
      createdAt: new Date().toISOString(),
      isMine: true,
      unreadByCount: 0,
      pending: true,
      failed: false,
    };

    // 1) 낙관적 추가
    addMessage(roomId, msg);

    // 2) 입력/첨부 초기화 + 포커스 유지
    clear(roomId);
    setTimeout(() => textareaRef.current?.focus(), 0);

    // 3) 전송(텍스트 + 업로드 첨부)
    try {
      const ack = await sendMessage({
        roomId,
        type: attachments.length ? "image" : "text",
        content: trimmed || undefined,
        // 업로드는 원본 파일로 전달(서버가 URL 생성 → ACK로 회신한다고 가정)
        attachments, // UploadAttachment[]
        clientMessageId, // 반드시 tmp id 전달
      });

      // ACK 형식 가정:
      // { ok: boolean, id?: string, seq?: number, createdAt?: string, attachments?: ChatAttachment[] }
      if (ack?.ok && ack.id) {
        // id 교체
        useMessagesStore
          .getState()
          .replaceMessageId(roomId, clientMessageId, ack.id);
        // seq/createdAt/attachments 등 서버 권위 값 반영
        const patch: Partial<ChatMessage> = {
          seq: typeof ack.seq === "number" ? ack.seq : undefined,
          createdAt: ack.createdAt ?? undefined,
          attachments: ack.attachments ?? undefined, // 서버가 최종 URL을 제공했다면 교체
          pending: false,
          failed: false,
        };
        useMessagesStore.getState().updateMessage(roomId, ack.id, patch);
        useMessagesStore.getState().markDelivered(roomId, ack.id);
      } else {
        useMessagesStore.getState().markFailed(roomId, clientMessageId);
      }
    } catch {
      useMessagesStore.getState().markFailed(roomId, clientMessageId);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!roomId) return;

    if (e.key === "Enter" && !e.shiftKey) {
      if (isComposing) {
        e.preventDefault();
        setPendingSend(roomId, true);
        return;
      }
      e.preventDefault();
      sendNow();
    }
  };

  const onCompositionStart = () => setIsComposing(true);

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

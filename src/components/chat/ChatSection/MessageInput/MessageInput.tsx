import {
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useEffect,
} from "react";
import styles from "./MessageInput.module.css";
import { AttachmentPreviewBar } from "../AttachmentPreviewBar";
import { PreviewItem } from "../../../../types";

type Props = {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  previews: PreviewItem[];
  onRemovePreview: (id: string) => void;
  onReorder: (next: PreviewItem[]) => void;
};

export const MessageInput = ({
  onSend,
  placeholder = "메시지를 입력하세요",
  disabled,
  previews,
  onRemovePreview,
  onReorder,
}: Props) => {
  const [value, setValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // ⬇️ 전송 직후에도, 리마운트 후에도 포커스 보장하기 위한 tick
  const [focusTick, setFocusTick] = useState(0);
  const requestFocus = useCallback(() => setFocusTick((t) => t + 1), []);

  // 리렌더/리마운트 직후 포커스 보장
  useLayoutEffect(() => {
    const el = taRef.current;
    if (el && !disabled) {
      el.focus();
      // iOS Safari 보강
      setTimeout(() => el.focus(), 0);
    }
  }, [focusTick, disabled]);

  // 컴포넌트 마운트 시 포커스
  useEffect(() => {
    if (!disabled) requestFocus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // disabled → false로 풀릴 때도 다시 포커스
  useEffect(() => {
    if (!disabled) requestFocus();
  }, [disabled, requestFocus]);

  const autoResize = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const submit = () => {
    if (disabled) return;

    const text = value.trim();
    // 텍스트 없고 첨부도 없으면 전송 안 함
    if (text.length === 0 && previews.length === 0) return;

    onSend(text); // 상위에서 previews 포함하여 처리
    setValue("");
    onReorder([]); // 첨부 비우기

    // 높이 리셋
    const el = taRef.current;
    if (el) el.style.height = "auto";

    // ✅ 전송 후 리렌더가 있어도 다음 사이클에 확실히 포커스
    requestFocus();
  };

  return (
    <div className={styles.wrapper}>
      <AttachmentPreviewBar
        items={previews}
        onRemove={onRemovePreview}
        onReorder={onReorder}
      />

      <div className={styles.inputRow}>
        <textarea
          ref={taRef}
          className={styles.textarea}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            autoResize();
          }}
          onKeyDown={(e) => {
            // Shift+Enter = 줄바꿈, IME 조합 중이면 전송 금지
            if (e.key === "Enter" && !e.shiftKey && !isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder={placeholder}
          rows={1}
          disabled={!!disabled}
          // 브라우저가 허용하는 경우 초기 포커스 힌트
          autoFocus
        />

        <button
          className={styles.sendBtn}
          type="button"
          onMouseDown={(e) => {
            // 클릭으로 포커스가 버튼으로 옮겨가는 걸 방지
            e.preventDefault();
          }}
          onClick={() => {
            submit();
            // 혹시 모를 환경용 보강
            requestFocus();
          }}
          disabled={
            !!disabled || (value.trim().length === 0 && previews.length === 0)
          }
        >
          보내기
        </button>
      </div>
    </div>
  );
};

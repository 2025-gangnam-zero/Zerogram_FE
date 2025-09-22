import { useRef, useState } from "react";
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
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const autoResize = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const submit = () => {
    const text = value.trim();

    // ✅ 변경: 텍스트가 없더라도 미리보기(첨부)가 있으면 전송 허용
    if (text.length === 0 && previews.length === 0) return;

    onSend(text); // 빈 문자열이어도 넘겨도 됨 (상위에서 previews와 함께 전송)
    setValue("");
    onReorder([]); // 첨부 비우기

    // 높이 리셋
    const el = taRef.current;
    if (el) el.style.height = "auto";
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
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
        />
        <button
          className={styles.sendBtn}
          type="button"
          onClick={submit}
          disabled={
            disabled || (value.trim().length === 0 && previews.length === 0)
          }
        >
          보내기
        </button>
      </div>
    </div>
  );
};

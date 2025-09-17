import { useRef, useState } from "react";
import styles from "./MessageInput.module.css";

type Props = {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export const MessageInput = ({
  onSend,
  placeholder = "메시지를 입력하세요",
  disabled,
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
    if (!text) return;
    onSend(text);
    setValue("");
    // 높이 리셋
    const el = taRef.current;
    if (el) {
      el.style.height = "auto";
    }
  };

  return (
    <div className={styles.wrapper}>
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
        disabled={disabled || value.trim().length === 0}
      >
        보내기
      </button>
    </div>
  );
};

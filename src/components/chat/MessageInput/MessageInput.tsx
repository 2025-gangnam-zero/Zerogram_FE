import { useState } from "react";
import styles from "./MessageInput.module.css";

type Props = {
  onSend: (text: string) => void;
};

export const MessageInput = ({ onSend }: Props) => {
  const [text, setText] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    onSend(v);
    setText("");
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <input
        className={styles.input}
        placeholder="메시지 입력..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className={styles.btn} type="submit">
        전송
      </button>
    </form>
  );
};

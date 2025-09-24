import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import styles from "./SearchBar.module.css";

type Props = {
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  onChange?: (q: string) => void;
  onSubmit?: (q: string) => void; // 엔터로 제출
};

export const SearchBar = ({
  defaultValue = "",
  placeholder = "채팅방 검색",
  autoFocus = false,
  className,
  onChange,
  onSubmit,
}: Props) => {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.(value.trim());
  };

  return (
    <form
      className={`${styles.container} ${className ?? ""}`}
      onSubmit={handleSubmit}
      role="search"
    >
      <div className={styles.inputWrap}>
        <Search className={styles.leftIcon} aria-hidden />
        <input
          className={styles.input}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onChange?.(e.target.value);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label="채팅방 검색"
        />
      </div>
    </form>
  );
};

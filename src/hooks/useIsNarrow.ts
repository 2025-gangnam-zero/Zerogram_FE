import { useEffect, useState } from "react";
import { CHAT_BREAKPOINT } from "../constants/chat";

export const useIsNarrow = (bp: number = CHAT_BREAKPOINT) => {
  const get = () =>
    typeof window !== "undefined" ? window.innerWidth <= bp : false;
  const [isNarrow, setIsNarrow] = useState(get);
  useEffect(() => {
    const on = () => setIsNarrow(get());
    const mql = window.matchMedia(`(max-width:${bp}px)`);
    on();
    window.addEventListener("resize", on);
    mql.addEventListener?.("change", on);
    return () => {
      window.removeEventListener("resize", on);
      mql.removeEventListener?.("change", on);
    };
  }, [bp]);
  return isNarrow;
};

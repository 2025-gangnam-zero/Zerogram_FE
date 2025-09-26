// src/hooks/useIsNarrow.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { CHAT_BREAKPOINT } from "../constants/chat";

export const useIsNarrow = (bp: number = CHAT_BREAKPOINT) => {
  // 1) get을 useCallback으로 메모이즈
  const get = useCallback(
    () => (typeof window !== "undefined" ? window.innerWidth <= bp : false),
    [bp]
  );

  // 2) 초기값 계산
  const initial = useMemo(() => get(), [get]);
  const [isNarrow, setIsNarrow] = useState(initial);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // resize 핸들러도 안정적으로
    const onResize = () => setIsNarrow(get());

    // matchMedia로도 변화 구독
    const mql = window.matchMedia(`(max-width: ${bp}px)`);
    const onMql = (e: MediaQueryListEvent) => setIsNarrow(e.matches);

    // 즉시 동기화
    onResize();

    window.addEventListener("resize", onResize);
    mql.addEventListener?.("change", onMql);

    return () => {
      window.removeEventListener("resize", onResize);
      mql.removeEventListener?.("change", onMql);
    };
  }, [bp, get]);

  return isNarrow;
};

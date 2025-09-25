import { SocketStatus } from "../../../components/chat";
import { useIsNarrow } from "../../../hooks/useIsNarrow";
import { CHAT_BREAKPOINT } from "../../../constants/chat";

export const ChatIndex = () => {
  const isNarrow = useIsNarrow(CHAT_BREAKPOINT);
  if (isNarrow) return null; // 모바일: 본문 비움 (목록은 햄버거→Drawer)

  // 와이드에서만 안내 문구 표시
  return (
    <div style={{ padding: 16 }}>
      <p>대화방을 선택하세요.</p>
      <SocketStatus />
    </div>
  );
};

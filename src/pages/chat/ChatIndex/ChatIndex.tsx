import { SocketStatus } from "../../../components/chat";
import { useIsNarrow } from "../../../hooks/useIsNarrow";
import { CHAT_BREAKPOINT } from "../../../constants/chat";
import { Sidebar } from "../../../components/chat/Sidebar";

export const ChatIndex = () => {
  const isNarrow = useIsNarrow(CHAT_BREAKPOINT);

  // ✅ 모바일(≤600px): 본문에 목록을 "직접" 렌더
  if (isNarrow) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Sidebar variant="mine" standalone />{" "}
        {/* 아래 Sidebar.tsx에 standalone 추가 */}
      </div>
    );
  }

  // 데스크톱(>600px): 기존 안내 문구 유지
  return (
    <div style={{ padding: 16 }}>
      <p>대화방을 선택하세요.</p>
      <SocketStatus />
    </div>
  );
};

import { SocketStatus } from "../../../components/chat";

export const ChatIndex = () => {
  return (
    <div style={{ padding: 16 }}>
      <p>대화방을 선택하세요.</p>
      <SocketStatus />
    </div>
  );
};

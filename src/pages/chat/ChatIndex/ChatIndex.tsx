import { SocketStatus } from "../../../components/chat";
import styles from "./ChatIndex.module.css";

export const ChatIndex = () => {
  return (
    <div style={{ padding: 16 }}>
      <p>대화방을 선택하세요.</p>
      <SocketStatus />
    </div>
  );
};

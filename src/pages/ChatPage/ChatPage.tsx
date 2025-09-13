import { useEffect, useState } from "react";
import styles from "./ChatPage.module.css";
import { CHThread } from "../../types";
import { ChatSection, Sidebar } from "../../components/chat";
import { me, mockThreads } from "../../data/data"; // ✅ 변경된 목데이터
import { bootstrapChat } from "../../store/bootstrap";

export const ChatPage = () => {
  const [activeId, setActiveId] = useState<string>(mockThreads[0]?.id ?? "");
  const crs: CHThread[] = mockThreads;

  useEffect(() => {
    bootstrapChat({ meId: me.id }); // user 스토어에서 id를 가져와 넘겨도 됨
  }, []);

  return (
    <div className={styles.wrap}>
      <Sidebar crs={crs} activeId={activeId} onSelect={setActiveId} />
      <ChatSection crs={crs} activeId={activeId} />
    </div>
  );
};

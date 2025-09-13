import { useEffect, useMemo, useRef } from "react";
import styles from "./MessageList.module.css";
import { Message, RoomMember } from "../../../types";
import { MessageItem } from "../MessageItem";

type Props = {
  messages: Message[];
  meId: string;
  members?: RoomMember[]; // ✅ 방 멤버 전달 (없으면 빈 배열)
  showReceiptFor?: "mine" | "all";
  includeAuthorInCount?: boolean;
};

export const MessageList: React.FC<Props> = ({
  messages,
  meId,
  members = [],
  showReceiptFor = "mine",
  includeAuthorInCount = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [messages.length]);

  // ✅ 내(뷰어)의 마지막 읽은 시각
  const myLastReadAt = useMemo(() => {
    const me = members.find((m) => m.user.id === meId);
    return me?.lastReadAt ?? 0;
  }, [members, meId]);

  // ✅ 첫 안읽은 메시지 인덱스 (없으면 -1)
  const firstUnreadIndex = useMemo(() => {
    if (!myLastReadAt) return -1;
    return messages.findIndex((m) => m.createdAt > myLastReadAt);
  }, [messages, myLastReadAt]);

  return (
    <div className={styles.wrap} ref={ref}>
      {messages.map((msg, i) => (
        <div key={msg.id}>
          {/* ✅ 첫 안읽은 메시지 직전에 구분선 렌더 */}
          {i === firstUnreadIndex && (
            <div
              className={styles.unreadDivider}
              role="separator"
              aria-label="여기까지 읽으셨습니다."
            >
              <span className={styles.unreadChip}>여기까지 읽으셨습니다.</span>
            </div>
          )}

          <MessageItem
            message={msg}
            mine={msg.authorId === meId}
            members={members}
            showReceiptFor={showReceiptFor}
            includeAuthorInCount={includeAuthorInCount}
          />
        </div>
      ))}
    </div>
  );
};

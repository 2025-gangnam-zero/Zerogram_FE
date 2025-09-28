import { useEffect, useRef } from "react";
import styles from "./MessageList.module.css";
import { MessageItem, NoticeBanner } from "../../../../components/chat";
import type { ChatMessage } from "../../../../types";

type Props = {
  showNotice?: boolean;
  noticeText?: string;
  messages: ChatMessage[];
  onReachTop?: () => void;
  loadingOlder?: boolean;
  hasMore?: boolean;
};

export const MessageList = ({
  showNotice,
  noticeText,
  messages,
  onReachTop,
  loadingOlder = false,
  hasMore = true,
}: Props) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const isObservingRef = useRef(false);

  // 새 메시지 도착 시 하단으로 스크롤 (기존 동작 유지)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // 상단 센티널 관찰
  useEffect(() => {
    if (!onReachTop || !hasMore) return;
    const root = scrollRef.current;
    const target = topSentinelRef.current;
    if (!root || !target) return;

    const io = new IntersectionObserver(
      (entries) => {
        const top = entries[0];
        if (top.isIntersecting && !loadingOlder && hasMore) {
          onReachTop();
        }
      },
      { root, rootMargin: "80px 0px 0px 0px", threshold: 0 }
    );

    io.observe(target);
    isObservingRef.current = true;

    return () => {
      if (isObservingRef.current) {
        io.unobserve(target);
        io.disconnect();
        isObservingRef.current = false;
      }
    };
  }, [onReachTop, loadingOlder, hasMore]);

  return (
    <div ref={scrollRef} className={styles.container} aria-label="메시지 목록">
      {/* 상단 로더/센티널 */}
      <div ref={topSentinelRef} className={styles.topSentinel} />
      {loadingOlder && (
        <div className={styles.loader} role="status" aria-live="polite">
          이전 메시지 불러오는 중…
        </div>
      )}
      {!hasMore && (
        <div className={styles.endMarker} aria-label="더 이상 없음">
          더 이상 불러올 메시지가 없습니다
        </div>
      )}

      {showNotice && noticeText && <NoticeBanner text={noticeText} />}

      {messages.map((m) => (
        <MessageItem
          key={
            m.id ??
            (typeof (m as any).seq === "number"
              ? String((m as any).seq)
              : undefined) ??
            (m as any).createdAtIso ??
            String((m as any).createdAt)
          }
          message={m}
        />
      ))}
    </div>
  );
};

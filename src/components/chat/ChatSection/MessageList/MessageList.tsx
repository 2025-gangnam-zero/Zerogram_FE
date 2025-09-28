import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import styles from "./MessageList.module.css";
import { MessageItem, NoticeBanner } from "../../../../components/chat";
import type { ChatMessage } from "../../../../types";

export type MessageListHandle = {
  /** 프리펜드 직전 스크롤 상태 스냅샷 */
  captureTopSnapshot: () => { scrollTop: number; scrollHeight: number } | null;
  /** 프리펜드 직후 스크롤 위치 복원 */
  restoreAfterPrepend: (
    snap: { scrollTop: number; scrollHeight: number } | null
  ) => void;
  /** 프리펜드로 messages.length 증가 시 다음 자동 바닥 스크롤 1회 무시 */
  suppressNextAutoScroll: () => void;
  /** 현재 바닥 근처인지 여부 반환 */
  isNearBottom: () => boolean;
  /** 강제로 하단으로 스크롤 */
  scrollToBottom: () => void;
};

type Props = {
  showNotice?: boolean;
  noticeText?: string;
  messages: ChatMessage[];
  onReachTop?: () => void;
  loadingOlder?: boolean;
  hasMore?: boolean;
};

export const MessageList = forwardRef<MessageListHandle, Props>(
  (
    {
      showNotice,
      noticeText,
      messages,
      onReachTop,
      loadingOlder = false,
      hasMore = true,
    }: Props,
    ref
  ) => {
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const topSentinelRef = useRef<HTMLDivElement | null>(null);
    const isObservingRef = useRef(false);

    // 자동 스크롤 제어
    const stickToBottomRef = useRef(true); // 사용자가 바닥 근처를 보는 중인지
    const suppressNextAutoScrollRef = useRef(false); // 프리펜드 직후 1회 자동 스크롤 무시

    // 사용자의 현재 위치가 바닥 근처인지 감지
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      const onScroll = () => {
        const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
        stickToBottomRef.current = distance < 16; // 16px 이내면 바닥 근처로 간주
      };
      el.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        el.removeEventListener("scroll", onScroll);
      };
    }, []);

    // 새 메시지 도착/변동 시: 조건부 바닥 고정
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;

      // 프리펜드로 길이가 늘어났을 때는 이번 한 번 자동 스크롤을 무시
      if (suppressNextAutoScrollRef.current) {
        suppressNextAutoScrollRef.current = false;
        return;
      }

      // 사용자가 하단 근처를 보고 있을 때만 바닥으로 붙이기
      if (stickToBottomRef.current) {
        el.scrollTop = el.scrollHeight;
      }
    }, [messages.length]);

    // 상단 센티널 관찰(무한 스크롤 트리거)
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

    // 프리펜드 전/후 스크롤 보존 + 제어용 imperative API
    useImperativeHandle(
      ref,
      (): MessageListHandle => ({
        captureTopSnapshot: () => {
          const el = scrollRef.current;
          if (!el) return null;
          return { scrollTop: el.scrollTop, scrollHeight: el.scrollHeight };
        },
        restoreAfterPrepend: (snap) => {
          if (!snap) return;
          const el = scrollRef.current;
          if (!el) return;
          // DOM 반영 이후 보정
          requestAnimationFrame(() => {
            const newHeight = el.scrollHeight;
            const delta = newHeight - snap.scrollHeight;
            el.scrollTop = snap.scrollTop + delta;
          });
        },
        suppressNextAutoScroll: () => {
          suppressNextAutoScrollRef.current = true;
        },
        isNearBottom: () => stickToBottomRef.current,
        scrollToBottom: () => {
          const el = scrollRef.current;
          if (!el) return;
          el.scrollTop = el.scrollHeight;
        },
      })
    );

    return (
      <div
        ref={scrollRef}
        className={styles.container}
        aria-label="메시지 목록"
      >
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
  }
);

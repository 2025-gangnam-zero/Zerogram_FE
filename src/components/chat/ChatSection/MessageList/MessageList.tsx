import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import styles from "./MessageList.module.css";
import { MessageItem, NoticeBanner } from "../../../../components/chat";
import type { ChatMessage } from "../../../../types";

export type MessageListHandle = {
  captureTopSnapshot: () => { scrollTop: number; scrollHeight: number } | null;
  restoreAfterPrepend: (
    snap: { scrollTop: number; scrollHeight: number } | null
  ) => void;
  suppressNextAutoScroll: () => void;
  isNearBottom: () => boolean;
  scrollToBottom: () => void;

  // ⬇️ 위치 저장/복원을 위한 앵커 API
  getVisibleAnchor: () => {
    id: string | null;
    offset: number;
    wasAtBottom: boolean;
  };
  restoreToAnchor: (id: string, offset: number) => void;
};

type Props = {
  showNotice?: boolean;
  noticeText?: string;
  messages: ChatMessage[];
  onReachTop?: () => void;
  loadingOlder?: boolean;
  hasMore?: boolean;

  /** 스크롤이 바닥 근처/이탈로 전환될 때 알림 */
  onNearBottomChange?: (near: boolean) => void;
};

const NEAR_BOTTOM_PX = 32; // 여유값(히스테리시스)

export const MessageList = forwardRef<MessageListHandle, Props>(
  (
    {
      showNotice,
      noticeText,
      messages,
      onReachTop,
      loadingOlder = false,
      hasMore = true,
      onNearBottomChange,
    }: Props,
    ref
  ) => {
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const topSentinelRef = useRef<HTMLDivElement | null>(null);
    const isObservingRef = useRef(false);

    // 자동 스크롤/상태
    const stickToBottomRef = useRef(true);
    const lastNearBottomRef = useRef<boolean | null>(null);
    const suppressNextAutoScrollRef = useRef(false);

    const computeNearBottom = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return true;
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      return distance <= NEAR_BOTTOM_PX;
    }, []);

    const emitNearBottomIfChanged = useCallback(
      (near: boolean) => {
        if (lastNearBottomRef.current === near) return;
        lastNearBottomRef.current = near;
        onNearBottomChange?.(near);
      },
      [onNearBottomChange]
    );

    // 스크롤 이벤트: 바닥 근처 여부 추적
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      const onScroll = () => {
        const near = computeNearBottom();
        stickToBottomRef.current = near;
        emitNearBottomIfChanged(near);
      };
      el.addEventListener("scroll", onScroll, { passive: true });
      // 초기 상태도 한 번 계산
      requestAnimationFrame(() => {
        const near = computeNearBottom();
        stickToBottomRef.current = near;
        emitNearBottomIfChanged(near);
      });
      return () => el.removeEventListener("scroll", onScroll);
    }, [computeNearBottom, emitNearBottomIfChanged]);

    // 새 메시지 변동 시: 조건부 바닥 고정 (프리펜드 1회 무시)
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;

      if (suppressNextAutoScrollRef.current) {
        suppressNextAutoScrollRef.current = false;
        return;
      }
      // DOM 업데이트 후 판정하여 오탐 방지
      requestAnimationFrame(() => {
        const near = computeNearBottom();
        stickToBottomRef.current = near;
        emitNearBottomIfChanged(near);
        if (near) el.scrollTop = el.scrollHeight;
      });
    }, [messages.length, computeNearBottom, emitNearBottomIfChanged]);

    // 상단 센티널(무한 스크롤)
    useEffect(() => {
      if (!onReachTop || !hasMore) return;
      const root = scrollRef.current;
      const target = topSentinelRef.current;
      if (!root || !target) return;

      const io = new IntersectionObserver(
        (entries) => {
          const top = entries[0];
          if (top.isIntersecting && !loadingOlder && hasMore) onReachTop();
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

    // Imperative API
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
          requestAnimationFrame(() => {
            const delta = el.scrollHeight - snap.scrollHeight;
            el.scrollTop = snap.scrollTop + delta;
            // 복원 이후 바닥 판정 갱신
            const near = computeNearBottom();
            stickToBottomRef.current = near;
            emitNearBottomIfChanged(near);
          });
        },
        suppressNextAutoScroll: () => {
          suppressNextAutoScrollRef.current = true;
        },
        isNearBottom: () => computeNearBottom(),
        scrollToBottom: () => {
          const el = scrollRef.current;
          if (!el) return;
          el.scrollTop = el.scrollHeight;
          const near = computeNearBottom();
          stickToBottomRef.current = near;
          emitNearBottomIfChanged(near);
        },

        // 현재 보이는 앵커 추출
        getVisibleAnchor: () => {
          const root = scrollRef.current;
          if (!root) return { id: null, offset: 0, wasAtBottom: true };
          const wasAtBottom = computeNearBottom();

          const children = Array.from(
            root.querySelectorAll<HTMLDivElement>("[data-mid]")
          );
          const top = root.scrollTop;
          let best: HTMLDivElement | null = null;
          let bestDelta = Infinity;
          for (const el of children) {
            const y = el.offsetTop;
            const delta = Math.abs(y - top);
            if (delta < bestDelta) {
              best = el;
              bestDelta = delta;
            }
          }
          if (!best) return { id: null, offset: 0, wasAtBottom };
          const id = best.getAttribute("data-mid");
          const offset = top - best.offsetTop; // 상대 오프셋
          return { id, offset, wasAtBottom };
        },

        // 특정 앵커로 정밀 복원
        restoreToAnchor: (id, offset) => {
          const root = scrollRef.current;
          if (!root || !id) return;

          const safe = id.replace(/"/g, '\\"'); // 간단 이스케이프
          const el = root.querySelector<HTMLDivElement>(`[data-mid="${safe}"]`);
          if (!el) return; // 현재 버퍼에 앵커가 없으면 복원 불가

          requestAnimationFrame(() => {
            root.scrollTop = el.offsetTop + offset;
            const near = computeNearBottom();
            stickToBottomRef.current = near;
            emitNearBottomIfChanged(near);
          });
        },
      }),
      [computeNearBottom, emitNearBottomIfChanged]
    );

    return (
      <div
        ref={scrollRef}
        className={styles.container}
        aria-label="메시지 목록"
      >
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

        {messages.map((m) => {
          // data-mid는 안정적인 키(서버 id/seq)를 사용
          const mid =
            m.id ??
            (typeof (m as any).seq === "number"
              ? `seq:${String((m as any).seq)}`
              : (m as any).createdAtIso ?? String((m as any).createdAt));

          return (
            <div key={mid} data-mid={mid}>
              <MessageItem message={m} />
            </div>
          );
        })}
      </div>
    );
  }
);

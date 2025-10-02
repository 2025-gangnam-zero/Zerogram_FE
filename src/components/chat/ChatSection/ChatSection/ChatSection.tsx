import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ChatSection.module.css";
import {
  ChatHeader,
  DragAndDrop,
  MessageInput,
  MessageList,
  MessageListHandle,
  NewMessageToast,
} from "../../../chat";
import { useNavigate, useParams } from "react-router-dom";
import { ChatMessage, PreviewItem } from "../../../../types";
import {
  eventBus,
  joinRoom,
  leaveRoom as leaveSocketRoom,
  normalizeAscending,
  onNewMessage,
  sendMessage,
} from "../../../../utils";
import {
  commitReadApi,
  getMessagesApi,
  getRoomApi,
  leaveRoomApi,
} from "../../../../api/chat";

const PAGE_SIZE = 30;

/** 방별 스크롤 상태 캐시(메모리). 새로고침하면 사라짐 */
type RoomScrollCache = {
  anchorId: string | null;
  offset: number;
  wasAtBottom: boolean;
  updatedAt: number;
};
const roomScrollCache = new Map<string, RoomScrollCache>();

export const ChatSection = () => {
  const navigate = useNavigate();
  const { roomid } = useParams();

  // 미디어 프리뷰
  const urlsRef = useRef<Set<string>>(new Set());
  const previewHostRef = useRef<HTMLDivElement | null>(null);
  const filesRef = useRef<Map<string, File>>(new Map());

  // 리스트 제어
  const listRef = useRef<MessageListHandle | null>(null);

  // 상태
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState<boolean>(false);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);

  // 읽음 커밋
  const commitTimerRef = useRef<number | null>(null);
  const lastSeenSeqRef = useRef<number | null>(null);
  const lastSeenMsgIdRef = useRef<string | null>(null);

  // 페이지네이션
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursorSeq, setCursorSeq] = useState<number | null>(null);

  // 하단 미도달 시 신규 메시지 토스트
  const [toastOpen, setToastOpen] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);

  // 직전 방 id (전환 시 캐시 저장용)
  const prevRoomIdRef = useRef<string | null>(null);

  // 무한스크롤 게이팅(초기 안정화 후 + 사용자가 위로 스크롤했을 때만 켬)
  const [ioEnabled, setIoEnabled] = useState(false);
  const settleTimerRef = useRef<number | null>(null);
  const settledRef = useRef(false);
  const userScrolledUpRef = useRef(false);

  const scheduleCommitRead = (rid: string) => {
    if (commitTimerRef.current) window.clearTimeout(commitTimerRef.current);
    commitTimerRef.current = window.setTimeout(async () => {
      commitTimerRef.current = null;
      if (!lastSeenSeqRef.current || !lastSeenMsgIdRef.current) return;
      try {
        await commitReadApi(rid, {
          lastReadSeq: lastSeenSeqRef.current,
          lastReadMessageId: lastSeenMsgIdRef.current,
        });
        eventBus.emit("rooms:clearUnread", rid);
      } catch {
        /* noop */
      }
    }, 200);
  };

  /** 방 전환/언마운트 시 현재 위치를 저장 */
  const persistScrollPosition = (rid: string | undefined | null) => {
    if (!rid) return;
    const anchor = listRef.current?.getVisibleAnchor?.();
    if (!anchor) return;
    roomScrollCache.set(rid, {
      anchorId: anchor.id,
      offset: anchor.offset,
      wasAtBottom: anchor.wasAtBottom,
      updatedAt: Date.now(),
    });
  };

  // 방 정보
  useEffect(() => {
    if (!roomid) {
      setRoom(null);
      return;
    }
    (async () => {
      try {
        const roomRes = await getRoomApi(roomid);
        setRoom(roomRes?.data?.room ?? null);
      } catch {
        setRoom(null);
      }
    })();
  }, [roomid]);

  useEffect(() => {
    setNoticeVisible(!!room?.notice?.enabled);
  }, [room?.notice?.enabled]);

  // 방 변경될 때 IO/플래그 초기화
  useEffect(() => {
    setIoEnabled(false);
    userScrolledUpRef.current = false;
    settledRef.current = false;
    if (settleTimerRef.current) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  }, [roomid]);

  // 초기 메시지 + “하단 또는 복원” 결정
  useEffect(() => {
    // 방이 바뀌는 시점: 이전 방의 위치 저장
    if (prevRoomIdRef.current && prevRoomIdRef.current !== roomid) {
      persistScrollPosition(prevRoomIdRef.current);
    }
    prevRoomIdRef.current = roomid ?? null;

    if (!roomid) {
      setMessages([]);
      setHasMore(true);
      setCursorSeq(null);
      setToastOpen(false);
      setUnseenCount(0);
      return;
    }

    (async () => {
      try {
        const res = await getMessagesApi(roomid, { limit: PAGE_SIZE });
        const items: ChatMessage[] = res?.data?.items ?? [];
        const orderedAsc = normalizeAscending(items);
        setMessages(orderedAsc);

        setHasMore(items.length === PAGE_SIZE);
        setCursorSeq(
          orderedAsc.length ? (orderedAsc[0] as any).seq ?? null : null
        );

        const newest = orderedAsc[orderedAsc.length - 1];
        if (newest) {
          lastSeenSeqRef.current = (newest as any).seq ?? null;
          lastSeenMsgIdRef.current = (newest as any).id ?? null;
          try {
            await commitReadApi(roomid, {
              lastReadMessageId: (newest as any).id,
              lastReadSeq: (newest as any).seq,
            });
            eventBus.emit("rooms:clearUnread", roomid);
          } catch {
            /* noop */
          }
        } else {
          lastSeenSeqRef.current = null;
          lastSeenMsgIdRef.current = null;
        }

        // 복원 or 하단 고정
        requestAnimationFrame(() => {
          const cached = roomScrollCache.get(roomid);
          if (cached) {
            if (cached.wasAtBottom) {
              listRef.current?.scrollToBottom?.();
            } else if (cached.anchorId) {
              listRef.current?.restoreToAnchor?.(
                cached.anchorId,
                cached.offset
              );
            }
          } else {
            listRef.current?.scrollToBottom?.();
          }

          // 초기 안정화 타이머(레이아웃/이미지 로딩 대기)
          if (settleTimerRef.current)
            window.clearTimeout(settleTimerRef.current);
          settleTimerRef.current = window.setTimeout(() => {
            settledRef.current = true;
            if (userScrolledUpRef.current) setIoEnabled(true);
            settleTimerRef.current = null;
          }, 500);
        });
      } catch (e) {
        console.error("[ChatSection] getMessagesApi failed:", e);
        setMessages([]);
        setHasMore(false);
        setCursorSeq(null);
      }
    })();

    // 언마운트 시 현재 방 위치 저장
    return () => {
      if (roomid) persistScrollPosition(roomid);
    };
  }, [roomid]);

  // 소켓 수신
  useEffect(() => {
    if (!roomid) return;

    joinRoom(roomid);
    const off = onNewMessage((msg) => {
      if (msg.roomId !== roomid) return;

      const nearBottom = listRef.current?.isNearBottom?.() ?? true;

      setMessages((prev) => [...prev, msg]);

      // 읽음 커밋 갱신
      lastSeenSeqRef.current = (msg as any).seq ?? lastSeenSeqRef.current;
      lastSeenMsgIdRef.current = (msg as any).id ?? lastSeenMsgIdRef.current;
      scheduleCommitRead(roomid);

      // 하단 근처면 자동 고정, 아니면 토스트
      if (nearBottom) {
        requestAnimationFrame(() => listRef.current?.scrollToBottom?.());
      } else {
        setUnseenCount((n) => Math.min(99, n + 1));
        setToastOpen(true);
      }
    });

    return () => {
      off();
      leaveSocketRoom(roomid);
      if (commitTimerRef.current) {
        window.clearTimeout(commitTimerRef.current);
        commitTimerRef.current = null;
      }
      lastSeenSeqRef.current = null;
      lastSeenMsgIdRef.current = null;
    };
  }, [roomid]);

  // 언마운트: 리소스 정리
  useEffect(() => {
    const urls = urlsRef.current;
    const files = filesRef.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
      urls.clear();
      files.clear();
    };
  }, []);

  useEffect(() => {
    if (!roomid) return;
    eventBus.emit("rooms:clearUnread", roomid);
  }, [roomid]);

  // 프리뷰
  const addFilesToPreview = (files: File[]) => {
    const kindOf = (f: File): PreviewItem["kind"] => {
      if (f.type.startsWith("image/")) return "image";
      if (f.type === "video/mp4") return "video";
      return "other";
    };

    setPreviews((prev) => {
      const remain = Math.max(0, 4 - prev.length);
      if (remain <= 0) return prev;

      const sliced = files.slice(0, remain);
      const created: PreviewItem[] = sliced.map((f) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const url = URL.createObjectURL(f);
        urlsRef.current.add(url);
        filesRef.current.set(id, f);
        return { id, url, name: f.name, kind: kindOf(f), file: f };
      });

      return [...prev, ...created];
    });
  };

  const removePreview = (id: string) => {
    setPreviews((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
        urlsRef.current.delete(target.url);
      }
      return prev.filter((p) => p.id !== id);
    });
    filesRef.current.delete(id);
  };

  // 전송
  const handleSend = async (text: string) => {
    if (!roomid) return;
    try {
      setSending(true);
      const ack = await sendMessage(roomid, { text, previews });
      if (!ack.ok) {
        console.error("send failed:", ack.error);
      } else {
        if (ack.seq && ack.id) {
          lastSeenSeqRef.current = ack.seq;
          lastSeenMsgIdRef.current = ack.id;
          scheduleCommitRead(roomid);
        }
        // 내가 보낸 메시지는 하단 고정
        requestAnimationFrame(() => listRef.current?.scrollToBottom?.());
        // 토스트 닫기/카운트 리셋(내가 하단으로 이동했으므로)
        setToastOpen(false);
        setUnseenCount(0);
      }

      previews.forEach((p) => {
        URL.revokeObjectURL(p.url);
        urlsRef.current.delete(p.url);
      });
      setPreviews([]);
      filesRef.current.clear();
    } finally {
      setSending(false);
    }
  };

  // 공지
  const handleToggleNotice = () => setNoticeVisible((v) => !v);
  const handleNoticeUpdated = (
    next: { enabled?: boolean; text?: string } | null
  ) => {
    setRoom((prev: any) => {
      if (!prev) return prev;
      if (!next) {
        setNoticeVisible(false);
        return { ...prev, notice: { enabled: false, text: "" } };
      }
      const enabled = !!next.enabled;
      setNoticeVisible(enabled);
      return { ...prev, notice: { enabled, text: next.text ?? "" } };
    });
  };

  // 방 나가기
  const handleLeaveRoom = async () => {
    if (!roomid) return;
    if (!window.confirm("이 방을 나가시겠어요?")) return;

    try {
      await leaveRoomApi(roomid);
      leaveSocketRoom(roomid);
      eventBus.emit("rooms:refresh");
      navigate("/chat");
    } catch {
      alert("나가기에 실패했습니다.");
    }
  };

  // ⬇️ 상단 프리펜드(스냅샷 보정 포함) — 핵심
  const onReachTop = async () => {
    if (!roomid || loadingOlder || !hasMore || cursorSeq == null) return;

    // 1) 현재 스크롤 상태 스냅샷
    const snap = listRef.current?.captureTopSnapshot?.() ?? null;

    // 2) 프리펜드 직후 자동 하단 고정 1회 억제
    listRef.current?.suppressNextAutoScroll?.();

    setLoadingOlder(true);
    try {
      const res = await getMessagesApi(roomid, {
        limit: PAGE_SIZE, // 필요시 20 등으로 줄여 프리펜드 비용 완화
        beforeSeq: cursorSeq,
      });
      const items: ChatMessage[] = res?.data?.items ?? [];
      const olderAsc = normalizeAscending(items);

      if (olderAsc.length > 0) {
        setMessages((prev) => [...olderAsc, ...prev]);
        setCursorSeq((olderAsc[0] as any).seq ?? cursorSeq);
      }
      if (olderAsc.length < PAGE_SIZE) setHasMore(false);
    } catch (e) {
      console.error("[ChatSection] getMessagesApi (older) failed:", e);
    } finally {
      setLoadingOlder(false);
      // 4) 늘어난 높이만큼 역보정
      listRef.current?.restoreAfterPrepend?.(snap);
    }
  };

  // 토스트 액션
  const handleToastClick = () => {
    listRef.current?.scrollToBottom?.();
    setUnseenCount(0);
    setToastOpen(false);
  };
  const handleToastClose = () => {
    setToastOpen(false);
    setUnseenCount(0);
  };

  // 리스트가 바닥 근처로 들어오거나 벗어나는 순간 콜백
  const handleNearBottomChange = (near: boolean) => {
    if (near) {
      // 바닥 근처에 오면 토스트/카운트 정리
      setUnseenCount(0);
      setToastOpen(false);
    } else {
      // 사용자가 바닥에서 이탈(= 위로 스크롤 시작)
      userScrolledUpRef.current = true;
      // 초기 안정화가 끝났다면 IO 활성화
      if (settledRef.current && !ioEnabled) setIoEnabled(true);
    }
  };

  const title = useMemo(
    () => room?.roomName || `방 ${roomid ?? ""}`,
    [room?.roomName, roomid]
  );
  const showNotice = noticeVisible;
  const noticeText = room?.notice?.text ?? "";
  const canManageNotice = ["owner", "admin"].includes(room?.myRole);

  return (
    <DragAndDrop
      onDropFiles={addFilesToPreview}
      accept={["image/*", "video/mp4"]}
      showOverlay
      className={styles.dropHost}
    >
      <section className={styles.section}>
        <ChatHeader
          roomId={roomid!}
          title={title}
          noticeEnabled={showNotice}
          onToggleNotice={handleToggleNotice}
          canManageNotice={canManageNotice}
          notice={room?.notice ?? null}
          onNoticeUpdated={handleNoticeUpdated}
          onLeaveRoom={handleLeaveRoom}
        />

        <MessageList
          ref={listRef}
          showNotice={showNotice}
          noticeText={noticeText}
          messages={messages}
          onReachTop={ioEnabled ? onReachTop : undefined} // 초기엔 비활성(조기 트리거 방지)
          loadingOlder={loadingOlder}
          hasMore={hasMore && ioEnabled}
          onNearBottomChange={handleNearBottomChange}
        />

        {/* 입력창 위 스티키 토스트 */}
        <NewMessageToast
          open={toastOpen}
          count={unseenCount}
          onClick={handleToastClick}
          onClose={handleToastClose}
        />

        <div ref={previewHostRef}>
          <MessageInput
            onSend={handleSend}
            disabled={sending}
            previews={previews}
            onRemovePreview={removePreview}
            onReorder={setPreviews}
          />
        </div>
      </section>
    </DragAndDrop>
  );
};

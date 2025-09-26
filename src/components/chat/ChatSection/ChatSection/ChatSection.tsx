// src/components/chat/ChatSection/ChatSection.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ChatSection.module.css";
import {
  ChatHeader,
  DragAndDrop,
  MessageInput,
  MessageList,
} from "../../../chat";
import { useNavigate, useParams } from "react-router-dom";
import { ChatMessage, PreviewItem } from "../../../../types";
import {
  eventBus,
  joinRoom,
  leaveRoom as leaveSocketRoom,
  onNewMessage,
  sendMessage,
} from "../../../../utils";
import {
  commitReadApi,
  getMessagesApi,
  getRoomApi,
  leaveRoomApi,
} from "../../../../api/chat";

export const ChatSection = () => {
  const navigate = useNavigate();
  const { roomid } = useParams();

  const urlsRef = useRef<Set<string>>(new Set());
  const previewHostRef = useRef<HTMLDivElement | null>(null);
  // ✅ 원본 파일 보관소: id -> File
  const filesRef = useRef<Map<string, File>>(new Map());

  const [room, setRoom] = useState<any>(null); // room 안에 roomName/notice/myRole 포함
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState<boolean>(false); // 공지 로컬 표시
  const [previews, setPreviews] = useState<PreviewItem[]>([]); // 미리보기(렌더 전용)

  // === 읽음 커밋 관리용 참조 & 디바운스 ===
  const commitTimerRef = useRef<number | null>(null);
  const lastSeenSeqRef = useRef<number | null>(null);
  const lastSeenMsgIdRef = useRef<string | null>(null);

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
        // 전역 동기화: 사이드바/패널/FAB 등에서 해당 방 배지 0 유지
        eventBus.emit("rooms:clearUnread", rid);
      } catch (e) {
        console.warn("[ChatSection] commitRead (debounced) failed:", e);
      }
    }, 200);
  };

  // 방 정보 로드
  useEffect(() => {
    if (!roomid) {
      setRoom(null);
      return;
    }
    (async () => {
      try {
        const roomRes = await getRoomApi(roomid);
        setRoom(roomRes?.data?.room ?? null);
      } catch (e) {
        console.error("[ChatSection] getRoomApi failed:", e);
        setRoom(null);
      }
    })();
  }, [roomid]);

  // room의 서버 공지 상태가 바뀌면 로컬 표시 초기화
  useEffect(() => {
    setNoticeVisible(!!room?.notice?.enabled);
  }, [room?.notice?.enabled]);

  // 메시지 초기 로드
  useEffect(() => {
    if (!roomid) {
      setMessages([]);
      return;
    }
    (async () => {
      try {
        const res = await getMessagesApi(roomid, { limit: 30 });
        const items = res?.data?.items ?? [];
        const ordered = [...items].reverse(); // 화면용 오래→새로
        setMessages(ordered);

        const last = items[0]; // 서버가 최신 DESC라고 가정
        if (last) {
          // ↳ 참조값 저장 후 커밋(서버 상태와 동기화)
          lastSeenSeqRef.current = last.seq ?? null;
          lastSeenMsgIdRef.current = last.id ?? null;
          try {
            await commitReadApi(roomid, {
              lastReadMessageId: last.id,
              lastReadSeq: last.seq,
            });
            eventBus.emit("rooms:clearUnread", roomid);
          } catch (e) {
            console.warn("[ChatSection] commitRead failed:", e);
          }
        } else {
          // 메시지가 없으면 참조 초기화
          lastSeenSeqRef.current = null;
          lastSeenMsgIdRef.current = null;
        }
      } catch (e) {
        console.error("[ChatSection] getMessagesApi failed:", e);
        setMessages([]);
      }
    })();
  }, [roomid]);

  // 소켓: 방 입장/퇴장 + 수신
  useEffect(() => {
    if (!roomid) return;

    joinRoom(roomid);
    const off = onNewMessage((msg) => {
      if (msg.roomId !== roomid) return;
      setMessages((prev) => [...prev, msg]);

      // ✅ 현재 방에서 도착한 새 메시지는 즉시 "본 것"으로 간주 → 커밋 스케줄
      lastSeenSeqRef.current = msg.seq ?? lastSeenSeqRef.current;
      lastSeenMsgIdRef.current = msg.id ?? lastSeenMsgIdRef.current;
      scheduleCommitRead(roomid);
    });

    return () => {
      off();
      leaveSocketRoom(roomid);
      if (commitTimerRef.current) {
        window.clearTimeout(commitTimerRef.current);
        commitTimerRef.current = null;
      }
      // 룸이 바뀔 때 참조 초기화(다음 방에서 새로 세팅)
      lastSeenSeqRef.current = null;
      lastSeenMsgIdRef.current = null;
    };
  }, [roomid]);

  // 언마운트 cleanup 수정 (최신 URL 전부 정리)
  useEffect(() => {
    const urls = urlsRef.current;
    const files = filesRef.current;

    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
      urls.clear();
      files.clear();
    };
  }, []);

  // ✅ 이 방을 보는 순간, 사이드바에게 "이 방 읽음 처리" 신호 (UI 동기화)
  useEffect(() => {
    if (!roomid) return;
    eventBus.emit("rooms:clearUnread", roomid);
  }, [roomid]);

  // ✅ 파일 → 프리뷰 삽입 + filesRef에 원본 File 저장
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
        return { id, url, name: f.name, kind: kindOf(f), file: f };
      });

      return [...prev, ...created];
    });
  };

  // ✅ 프리뷰 제거 시: ObjectURL 해제 + filesRef에서 원본 제거
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

  // 전송(여기서는 텍스트만 소켓, 파일은 서버 업로드 후 메타만 전송 권장)
  const handleSend = async (text: string) => {
    if (!roomid) return;
    try {
      setSending(true);

      const ack = await sendMessage(roomid, {
        text,
        previews,
      });
      if (!ack.ok) {
        console.error("send failed:", ack.error);
      } else {
        // ✅ 내가 보낸 메시지도 마지막으로 본 것으로 처리(ACK에 seq/id가 있다면)
        if (ack.seq && ack.id) {
          lastSeenSeqRef.current = ack.seq;
          lastSeenMsgIdRef.current = ack.id;
          scheduleCommitRead(roomid);
        }
      }

      // 성공 시 정리
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

  // ✅ 공지 버튼: 로컬 표시 토글만 (서버 저장 X)
  const handleToggleNotice = () => {
    setNoticeVisible((v) => !v);
  };

  // ✅ 관리자 모달 저장/삭제 후 동기화 (서버 결과를 room + 로컬 표시로 반영)
  const handleNoticeUpdated = (
    next: { enabled?: boolean; text?: string } | null
  ) => {
    setRoom((prev: any) => {
      if (!prev) return prev;
      if (!next) {
        // 삭제된 경우
        setNoticeVisible(false);
        return { ...prev, notice: { enabled: false, text: "" } };
      }
      const enabled = !!next.enabled;
      setNoticeVisible(enabled);
      return { ...prev, notice: { enabled, text: next.text ?? "" } };
    });
  };

  const handleLeaveRoom = async () => {
    if (!roomid) return;
    if (!window.confirm("이 방을 나가시겠어요?")) return;

    try {
      await leaveRoomApi(roomid); // ✅ 서버에 탈퇴 요청
      leaveSocketRoom(roomid); // ✅ 소켓 룸 이탈
      eventBus.emit("rooms:refresh");
      navigate("/chat"); // ✅ 목록 화면 등으로 이동
    } catch (e) {
      console.error("[ChatSection] leaveRoomApi failed:", e);
      alert("나가기에 실패했습니다.");
    }
  };

  const title = useMemo(
    () => room?.roomName || `방 ${roomid ?? ""}`,
    [room?.roomName, roomid]
  );

  // 언마운트 시 ObjectURL/파일 정리
  useEffect(() => {
    const files = filesRef.current;

    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      files.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 렌더링에 사용할 값
  const showNotice = noticeVisible; // ← 로컬 표시 상태
  const noticeText = room?.notice?.text ?? ""; // ← 서버에 저장된 텍스트
  const canManageNotice = ["owner", "admin"].includes(room?.myRole);

  return (
    <DragAndDrop
      onDropFiles={addFilesToPreview}
      accept={["image/*", "video/mp4"]}
      showOverlay
      className={styles.dropHost}
      // 필요 시 ignoreRef={previewHostRef} 등을 넘겨 내부 DnD 제외 가능
    >
      <section className={styles.section}>
        <ChatHeader
          roomId={roomid!}
          title={title}
          noticeEnabled={showNotice}
          onToggleNotice={handleToggleNotice} // 로컬 토글만
          canManageNotice={canManageNotice}
          notice={room?.notice ?? null}
          onNoticeUpdated={handleNoticeUpdated}
          onLeaveRoom={handleLeaveRoom}
        />

        <MessageList
          showNotice={showNotice}
          noticeText={noticeText}
          messages={messages}
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

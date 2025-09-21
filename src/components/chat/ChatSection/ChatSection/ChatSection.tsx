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

  const previewHostRef = useRef<HTMLDivElement | null>(null);
  // ✅ 원본 파일 보관소: id -> File
  const filesRef = useRef<Map<string, File>>(new Map());

  const [room, setRoom] = useState<any>(null); // room 안에 roomName/notice/myRole 포함
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState<boolean>(false); // 공지 로컬 표시
  const [previews, setPreviews] = useState<PreviewItem[]>([]); // 미리보기(렌더 전용)

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

        const last = items[0]; // 서버가 최신 desc라고 가정
        if (last) {
          try {
            await commitReadApi(roomid, {
              lastReadMessageId: last.id,
              lastReadSeq: last.seq,
            });
          } catch (e) {
            console.warn("[ChatSection] commitRead failed:", e);
          }
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
    });

    return () => {
      off();
      leaveSocketRoom(roomid);
    };
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
        // 원본 파일은 렌더 상태에 넣지 않고 ref 맵에 보관
        filesRef.current.set(id, f);

        return {
          id,
          url: URL.createObjectURL(f),
          name: f.name,
          kind: kindOf(f),
          file: f,
        };
      });

      return [...prev, ...created];
    });
  };

  // ✅ 프리뷰 제거 시: ObjectURL 해제 + filesRef에서 원본 제거
  const removePreview = (id: string) => {
    setPreviews((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
    filesRef.current.delete(id);
  };

  // 전송(여기서는 텍스트만 소켓, 파일은 서버 업로드 후 메타만 전송 권장)
  const handleSend = async (text: string) => {
    if (!roomid) return;
    try {
      setSending(true);

      // ✅ 미리보기 순서대로 원본 파일 수집 (이후 서버 HTTP 업로드에 사용)
      const filesToUpload: File[] = previews
        .map((p) => filesRef.current.get(p.id))
        .filter((f): f is File => !!f);

      // TODO:
      // 1) filesToUpload를 서버 HTTP 업로드 API로 전송 → attachments 메타 수신
      // const { attachments } = await uploadFilesApi(filesToUpload);
      // 2) 소켓으로 텍스트 + attachments만 전송
      const ack = await sendMessage({
        roomId: roomid,
        text,
        // attachments,
      });
      if (!ack.ok) console.error("send failed:", ack.error);

      // 성공 시 정리
      previews.forEach((p) => URL.revokeObjectURL(p.url));
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
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      filesRef.current.clear();
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

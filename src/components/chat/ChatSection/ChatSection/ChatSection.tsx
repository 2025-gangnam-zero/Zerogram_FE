// src/components/chat/ChatSection/ChatSection.tsx
import { useEffect, useMemo, useState } from "react";
import styles from "./ChatSection.module.css";
import { ChatHeader, MessageInput, MessageList } from "../../../chat";
import { useNavigate, useParams } from "react-router-dom";
import { ChatMessage } from "../../../../types";
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
  const [room, setRoom] = useState<any>(null); // room 안에 roomName/notice/myRole 포함
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  // ✅ 공지 "표시 여부"는 로컬 상태로만 관리 (서버 상태와 분리)
  const [noticeVisible, setNoticeVisible] = useState<boolean>(false);

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

  // 전송
  const handleSend = async (text: string) => {
    if (!roomid) return;
    try {
      setSending(true);
      const ack = await sendMessage({ roomId: roomid, text });
      if (!ack.ok) console.error("send failed:", ack.error);
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

  // 렌더링에 사용할 값
  const showNotice = noticeVisible; // ← 로컬 표시 상태
  const noticeText = room?.notice?.text ?? ""; // ← 서버에 저장된 텍스트
  const canManageNotice = ["owner", "admin"].includes(room?.myRole);

  return (
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

      <MessageInput onSend={handleSend} disabled={sending} />
    </section>
  );
};

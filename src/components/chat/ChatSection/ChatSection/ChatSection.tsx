import { useEffect, useMemo, useState } from "react";
import styles from "./ChatSection.module.css";
import { ChatHeader, MessageInput, MessageList } from "../../../chat";
import { useParams } from "react-router-dom";
import { ChatMessage } from "../../../../types";
import {
  joinRoom,
  leaveRoom,
  onNewMessage,
  sendMessage,
} from "../../../../utils";
import {
  commitReadApi,
  getMessagesApi,
  getRoomApi,
  getRoomNoticeApi,
  updateRoomNoticeApi,
} from "../../../../api/chat";

export const ChatSection = () => {
  const { roomid } = useParams();
  const [roomTitle, setRoomTitle] = useState<string>("");
  const [noticeOn, setNoticeOn] = useState(false);
  const [noticeText, setNoticeText] = useState(
    "오늘 19:00 한강 러닝 공지 — 참여하실 분은 🖐"
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  // 방 정보/공지 로드
  useEffect(() => {
    if (!roomid) return;
    (async () => {
      try {
        // 방 제목
        const roomRes = await getRoomApi(roomid);
        const room = roomRes?.data?.room;
        setRoomTitle(room?.roomName ?? `방 ${roomid}`);

        // 공지
        const noticeRes = await getRoomNoticeApi(roomid);
        const notice = noticeRes?.data?.notice;
        if (notice) {
          setNoticeOn(!!notice.enabled);
          if (notice.text) setNoticeText(notice.text);
        } else {
          setNoticeOn(false);
        }
      } catch (e) {
        console.error("[ChatSection] load room/notice failed:", e);
        setRoomTitle(`방 ${roomid}`);
      }
    })();
  }, [roomid]);

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
        // 최신이 뒤로 밀리도록(리스트가 아래로 스크롤) 이미 서버가 seq desc로 내려온다면 아래처럼 역순 필요 없음.
        // 여기서는 서버가 최신→과거(seq desc)로 내려온다고 가정하고, 화면 표시용으로 역순 정렬:
        const ordered = [...items].reverse();
        setMessages(ordered);

        // 읽음 커밋: 가장 마지막(가장 최신) 기준
        const last = items[0]; // 서버가 desc면 index 0이 최신
        if (last) {
          try {
            await commitReadApi(roomid, {
              lastReadMessageId: last.id, // ← _id를 의미하는 id
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
      // 서버 브로드캐스트 payload가 ChatMessage 형태(id=_id, serverId 별도)로 온다고 전제
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      off();
      leaveRoom(roomid);
    };
  }, [roomid]);

  // 전송
  const handleSend = async (text: string) => {
    if (!roomid) return;
    try {
      setSending(true);
      const ack = await sendMessage({ roomId: roomid, text });
      if (!ack.ok) {
        console.error("send failed:", ack.error);
      }
      // 낙관적 추가 없음(서버 echo로만 반영)
    } finally {
      setSending(false);
    }
  };

  // 공지 토글/수정(간단 토글만)
  const handleToggleNotice = async () => {
    if (!roomid) return;
    try {
      const nextEnabled = !noticeOn;
      await updateRoomNoticeApi(roomid, {
        text: noticeText,
        enabled: nextEnabled,
      });
      setNoticeOn(nextEnabled);
    } catch (e) {
      console.error("[ChatSection] updateRoomNoticeApi failed:", e);
    }
  };

  const title = useMemo(
    () => roomTitle || `방 ${roomid ?? ""}`,
    [roomTitle, roomid]
  );

  return (
    <section className={styles.section}>
      <ChatHeader
        title={title}
        noticeEnabled={noticeOn}
        onToggleNotice={handleToggleNotice}
        onAction={(a) => {
          console.log("[MoreMenu Action]", a);
        }}
      />

      <MessageList
        showNotice={noticeOn}
        noticeText={noticeText}
        messages={messages}
      />

      <MessageInput onSend={handleSend} disabled={sending} />
    </section>
  );
};

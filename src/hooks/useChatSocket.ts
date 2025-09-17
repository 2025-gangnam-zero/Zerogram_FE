// src/hooks/useChatSocket.ts
import { useEffect, useMemo, useRef } from "react";
import { getSocket } from "../utils/socket";
import { useChatUIStore } from "../store/";
import { useMessagesStore } from "../store";
import { MessageDto, RoomJoinAck } from "../types";

const ROOM_JOIN_TIMEOUT_MS = 5000;
const FETCH_PAGE_LIMIT = 50;

// 누락 메시지 페이지네이션 fetch
async function fetchSince(
  roomId: string,
  sinceSeq: number,
  limit = FETCH_PAGE_LIMIT
) {
  const base = (
    process.env.REACT_APP_SERVER_URL ?? "http://localhost:4000"
  ).replace(/\/$/, "");
  // TODO : SERVER API 추가 필요
  const url = `${base}/rooms/${roomId}/messages?sinceSeq=${sinceSeq}&limit=${limit}`;
  const res = await fetch(url, { credentials: "include" });
  // if (!res.ok) throw new Error(`fetchSince ${res.status}`);
  return (await res.json()) as {
    messages: MessageDto[];
    nextSeq?: number | null;
  };
}

// 지수 백오프
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function joinWithAckAndBackfill(
  sock: ReturnType<typeof getSocket>,
  roomId: string,
  {
    addMessage,
    getLastSeenSeq,
    setLastSeenSeq,
  }: {
    addMessage: (rid: string, m: MessageDto) => void;
    getLastSeenSeq: (rid: string) => number;
    setLastSeenSeq: (rid: string, seq: number) => void;
  },
  maxRetries = 3
): Promise<boolean> {
  let attempt = 0;

  while (attempt <= maxRetries) {
    const ack: RoomJoinAck | null = await new Promise((resolve) => {
      // NOTE: socket.io v4 timeout: (err, res) 콜백 시그니처
      console.log(roomId);

      (sock as any)
        .timeout(ROOM_JOIN_TIMEOUT_MS)
        .emit("room:join", { roomId }, (err: any, res: RoomJoinAck) => {
          if (err) resolve(null);
          else resolve(res);
        });
    });

    if (!ack) {
      // 타임아웃/네트워크 에러 → 재시도
      attempt += 1;
      if (attempt > maxRetries) {
        console.warn("[ws] room:join timeout:", roomId);
        return false;
      }
      await delay(300 * attempt ** 2);
      continue;
    }

    if (!ack.ok) {
      console.warn("[ws] room:join failed:", roomId, ack);
      return false; // 권한/비멤버 등은 재시도 무의미
    }

    // ✅ 갭 복구
    let since = getLastSeenSeq(roomId);
    const serverLatest = ack.sinceSeq;

    while (since < serverLatest) {
      const { messages, nextSeq } = await fetchSince(
        roomId,
        since,
        FETCH_PAGE_LIMIT
      );
      for (const m of messages) {
        addMessage(roomId, m);
        if (m.seq > since) since = m.seq;
        setLastSeenSeq(roomId, since);
      }
      if (!nextSeq) break;
      since = nextSeq; // 다음 페이지 시작점
    }

    return true;
  }

  return false;
}

export function useChatSocket(currentRoomIds: string[] = []) {
  const joinedRoomsRef = useRef<Set<string>>(new Set()); // 현재 소켓상 join된 방

  // 정렬/중복 제거 후 키 생성 → 의도치 않은 재실행 방지
  const wantRooms = useMemo(() => {
    const dedupSorted = Array.from(
      new Set(currentRoomIds.filter(Boolean))
    ).sort();

    return new Set(dedupSorted);
  }, [currentRoomIds.slice().sort().join("|")]);

  useEffect(() => {
    const sock = getSocket();

    // ---- 스토어 함수 바인딩 (고정 레퍼런스) ----
    const { addMessage, getLastSeenSeq, setLastSeenSeq } =
      useMessagesStore.getState();
    const { setTyping } = useChatUIStore.getState();

    // 상세 이벤트 리스너 — 중복 방지 위해 off 후 on
    const onMessageNew = (msg: MessageDto) => {
      addMessage(msg.roomId, msg);
      const cur = getLastSeenSeq(msg.roomId);
      if (msg.seq > cur) setLastSeenSeq(msg.roomId, msg.seq);
    };
    const onTyping = (p: { roomId: string; userId: string; on: boolean }) => {
      setTyping(p.roomId, p.userId, p.on);
    };

    sock.off("message:new", onMessageNew);
    sock.on("message:new", onMessageNew);
    sock.off("typing", onTyping);
    sock.on("typing", onTyping);

    // 연결 보장
    if (!sock.connected) sock.connect();

    // 재연결 시: 현재 join된 방 전부 재-join + 갭 복구
    const onReconnect = async () => {
      for (const rid of Array.from(joinedRoomsRef.current)) {
        await joinWithAckAndBackfill(sock, rid, {
          addMessage,
          getLastSeenSeq,
          setLastSeenSeq,
        });
      }
    };
    sock.off("reconnect", onReconnect);
    sock.on("reconnect", onReconnect);

    // ---- Set diff로 join/leave 계산 ----
    const toJoin: string[] = [];
    const toLeave: string[] = [];
    for (const rid of Array.from(wantRooms))
      if (!joinedRoomsRef.current.has(rid)) toJoin.push(rid);
    for (const rid of Array.from(joinedRoomsRef.current))
      if (!wantRooms.has(rid)) toLeave.push(rid);

    // 조인 실행 (연결 전이면 connect 이벤트에서 일괄 처리)
    const doJoinAll = async () => {
      for (const rid of toJoin) {
        const ok = await joinWithAckAndBackfill(sock, rid, {
          addMessage,
          getLastSeenSeq,
          setLastSeenSeq,
        });
        if (ok) joinedRoomsRef.current.add(rid);
      }
    };
    if (toJoin.length) {
      if (sock.connected) void doJoinAll();
      else sock.once("connect", doJoinAll);
    }

    // 리브 실행(멱등)
    for (const rid of toLeave) {
      sock.emit("room:leave", { roomId: rid }, () => {
        joinedRoomsRef.current.delete(rid);
      });
    }

    // ---- 정리(Cleanup) ----
    return () => {
      // 현재 join된 방 스냅샷을 안전하게 leave
      const snapshot = Array.from(joinedRoomsRef.current);
      for (const rid of snapshot) {
        if (wantRooms.has(rid)) {
          // 이번 렌더에서 계속 보고 있는 방은 유지
          continue;
        }
        sock.emit("room:leave", { roomId: rid }, () => {
          joinedRoomsRef.current.delete(rid);
        });
      }
      sock.off("message:new", onMessageNew);
      sock.off("typing", onTyping);
      sock.off("reconnect", onReconnect);
    };
  }, [wantRooms]);
}

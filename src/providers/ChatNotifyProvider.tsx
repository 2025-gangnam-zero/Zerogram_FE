// src/features/chat-notify/ChatNotifyProvider.tsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useParams } from "react-router-dom";
import { getMyRoomsApi } from "../api/chat";
import { SidebarListItemData } from "../types";
import { eventBus, onNewMessage } from "../utils";

export type ChatNotifItem = {
  roomId: string;
  roomName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unread: number;
};

type Ctx = {
  unreadTotal: number;
  items: ChatNotifItem[];
  markRoomRead: (roomId: string) => void;
  clearAll: () => void;
};

const ChatNotifyCtx = createContext<Ctx | null>(null);
export const useChatNotify = () => {
  const ctx = useContext(ChatNotifyCtx);
  if (!ctx)
    throw new Error("useChatNotify must be used within <ChatNotifyProvider>");
  return ctx;
};

export const ChatNotifyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [map, setMap] = useState<Map<string, ChatNotifItem>>(new Map());

  // ✅ roomId → roomName 캐시
  const roomNameMap = useRef<Map<string, string>>(new Map());
  const fetchingRef = useRef<boolean>(false);

  const location = useLocation();
  const params = useParams();
  const activeRoomIdRef = useRef<string | undefined>(undefined);

  /** 캐시 갱신: 내 방 목록을 불러와 roomNameMap 채움 */
  const hydrateRooms = async () => {
    if (fetchingRef.current) return;
    try {
      fetchingRef.current = true;
      const res = await getMyRoomsApi({ limit: 100 });
      const items: SidebarListItemData[] = res?.data?.items ?? [];
      for (const it of items) {
        if (it?.id && it?.roomName) roomNameMap.current.set(it.id, it.roomName);
      }
      // 알림 목록에도 roomName 보강
      setMap((prev) => {
        const next = new Map(prev);
        roomNameMap.current.forEach((n, rid) => {
          const it = next.get(rid);
          if (it && !it.roomName) {
            next.set(rid, { ...it, roomName: n });
          }
        });

        return next;
      });
    } catch (e) {
      console.error("[ChatNotify] hydrateRooms failed:", e);
    } finally {
      fetchingRef.current = false;
    }
  };

  // 최초 1회 룸 캐시 적재
  useEffect(() => {
    void hydrateRooms();
  }, []);

  // rooms:refresh 이벤트가 발생하면 캐시 재적재
  useEffect(() => {
    const off = eventBus.on("rooms:refresh", () => {
      void hydrateRooms();
    });
    return () => off();
  }, []);

  // 현재 활성 방 추적 + 진입 시 해당 방 unread 0 처리
  useEffect(() => {
    const m = location.pathname.match(/^\/chat\/([^/]+)/);
    activeRoomIdRef.current = m?.[1];
    if (m?.[1]) {
      setMap((prev) => {
        const next = new Map(prev);
        const item = next.get(m[1]!);
        if (item && item.unread > 0) next.set(m[1]!, { ...item, unread: 0 });
        return next;
      });
    }
  }, [location.pathname, params.roomid]);

  // 새 메시지 구독
  useEffect(() => {
    const off = onNewMessage((msg: any) => {
      const active = activeRoomIdRef.current;
      if (active === msg.roomId) return; // 보고 있는 방은 카운트 X

      // ✅ roomName 캐시 조회 (없으면 나중에 비동기로 메움)
      const cachedName = roomNameMap.current.get(msg.roomId);

      setMap((prev) => {
        const next = new Map(prev);
        const cur = next.get(msg.roomId) ?? {
          roomId: msg.roomId,
          roomName: cachedName, // 없으면 undefined (표시는 패널에서 안전 처리)
          lastMessage: "",
          lastMessageAt: "",
          unread: 0,
        };
        next.set(msg.roomId, {
          ...cur,
          roomName: cachedName ?? cur.roomName, // 캐시 있으면 반영
          lastMessage: msg.text ?? cur.lastMessage,
          lastMessageAt: msg.createdAt ?? cur.lastMessageAt,
          unread: (cur.unread ?? 0) + 1,
        });
        return next;
      });

      // 캐시에 없으면 백그라운드로 한 번 캐시 적재 시도
      if (!cachedName) void hydrateRooms();
    });
    return () => {
      typeof off === "function" && off();
    };
  }, []);

  const markRoomRead = (roomId: string) => {
    setMap((prev) => {
      const next = new Map(prev);
      const item = next.get(roomId);
      if (item) next.set(roomId, { ...item, unread: 0 });
      return next;
    });
  };

  const clearAll = () => setMap(new Map());

  const items = useMemo(() => {
    const arr = Array.from(map.values());
    // 최신순 정렬
    arr.sort((a, b) => {
      const ta = a.lastMessageAt ? +new Date(a.lastMessageAt) : 0;
      const tb = b.lastMessageAt ? +new Date(b.lastMessageAt) : 0;
      return tb - ta;
    });
    // ✅ roomName 보강(최신 캐시 반영)
    for (const it of arr) {
      if (!it.roomName) {
        const n = roomNameMap.current.get(it.roomId);
        if (n) it.roomName = n;
      }
    }
    return arr;
  }, [map]);

  const unreadTotal = useMemo(
    () => items.reduce((acc, it) => acc + (it.unread ?? 0), 0),
    [items]
  );

  const value: Ctx = { unreadTotal, items, markRoomRead, clearAll };
  return (
    <ChatNotifyCtx.Provider value={value}>{children}</ChatNotifyCtx.Provider>
  );
};

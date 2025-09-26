import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  getMyRoomsApi,
  getNotificationsApi,
  markRoomReadApi,
} from "../api/chat";
import { SidebarListItemData } from "../types";
import { eventBus, onNewMessage, onNotifyUpdate } from "../utils";

export type ChatNotifItem = {
  roomId: string;
  roomName?: string;
  lastMessage?: string;
  lastMessageAt?: string; // ISO
  unread: number; // 0 또는 1 (클램프)
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

// ----- Helpers -----
const rid = (id: unknown) => (typeof id === "string" ? id : String(id));
const clampUnread1 = (n: unknown) => (typeof n === "number" && n > 0 ? 1 : 0);
const isNewer = (nextIso?: string, prevIso?: string) => {
  if (!nextIso) return false;
  if (!prevIso) return true;
  return +new Date(nextIso) > +new Date(prevIso);
};

export const ChatNotifyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [map, setMap] = useState<Map<string, ChatNotifItem>>(new Map());

  // roomId → roomName 캐시
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
        if (it?.id && it?.roomName)
          roomNameMap.current.set(rid(it.id), it.roomName);
      }
      // 알림 목록에도 roomName 보강
      setMap((prev) => {
        const next = new Map(prev);
        roomNameMap.current.forEach((n, key) => {
          const it = next.get(key);
          if (it && !it.roomName) {
            next.set(key, { ...it, roomName: n });
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
    activeRoomIdRef.current = m?.[1] ? rid(m[1]) : undefined;

    if (m?.[1]) {
      const key = rid(m[1]);
      setMap((prev) => {
        const next = new Map(prev);
        const item = next.get(key);
        if (item && item.unread > 0) next.set(key, { ...item, unread: 0 });
        return next;
      });
    }
  }, [location.pathname, params.roomid]);

  // 새 메시지 구독: 보고 있는 방은 제외, 같은 방의 새 메시지는 항상 unread=1, 스냅샷은 최신으로 교체
  useEffect(() => {
    const off = onNewMessage((msg: any) => {
      const key = rid(msg.roomId);
      const active = activeRoomIdRef.current;
      if (active === key) return; // 보고 있는 방은 카운트 X (0 유지)

      const cachedName = roomNameMap.current.get(key);

      setMap((prev) => {
        const next = new Map(prev);
        const cur = next.get(key) ?? {
          roomId: key,
          roomName: cachedName,
          lastMessage: "",
          lastMessageAt: "",
          unread: 0,
        };

        next.set(key, {
          ...cur,
          roomName: cachedName ?? cur.roomName,
          lastMessage: msg.text ?? cur.lastMessage,
          lastMessageAt: msg.createdAt ?? cur.lastMessageAt,
          unread: 1, // ★ 같은 방에서 몇 개를 받아도 1
        });
        return next;
      });

      if (!cachedName) void hydrateRooms();
    });
    return () => {
      if (typeof off === "function") off();
    };
  }, []);

  // ① 최초/로그인 후 초기 동기화 (서버 계산값 기준) — unread을 0/1로 클램프하여 저장
  useEffect(() => {
    (async () => {
      try {
        const res = await getNotificationsApi();
        const items = res?.data?.items ?? [];
        setMap(() => {
          const next = new Map<string, ChatNotifItem>();
          for (const it of items) {
            const key = rid(it.roomId);
            next.set(key, {
              roomId: key,
              roomName: it.roomName,
              lastMessage: it.lastMessage,
              lastMessageAt: it.lastMessageAt,
              unread: clampUnread1(it.unread), // ★ 클램프
            });
            if (it.roomName) roomNameMap.current.set(key, it.roomName);
          }
          return next;
        });
      } catch (e) {
        console.error("[ChatNotify] initial sync failed:", e);
      }
    })();
  }, []);

  // ② 실시간 알림 구독 → 방 단위 1개로 최신치 갱신(서버 값이 더 최신일 때만 교체), unread는 0/1 클램프
  useEffect(() => {
    const off = onNotifyUpdate((n) => {
      const key = rid(n.roomId);
      const active = activeRoomIdRef.current;
      const unread = active === key ? 0 : clampUnread1(n.unread);
      const cachedName = roomNameMap.current.get(key) ?? n.roomName;
      if (cachedName) roomNameMap.current.set(key, cachedName);

      setMap((prev) => {
        const cur = prev.get(key) ?? { roomId: key, unread: 0 };
        const next = new Map(prev);
        const newer = isNewer(n.lastMessageAt, cur.lastMessageAt);

        next.set(key, {
          ...cur,
          roomName: cachedName ?? cur.roomName,
          lastMessage: newer
            ? n.lastMessage ?? cur.lastMessage
            : cur.lastMessage,
          lastMessageAt: newer
            ? n.lastMessageAt ?? cur.lastMessageAt
            : cur.lastMessageAt,
          unread,
        });
        return next;
      });
    });
    return () => {
      if (typeof off === "function") off();
    };
  }, []);

  const markRoomRead = async (roomId: string) => {
    const key = rid(roomId);
    setMap((prev) => {
      const next = new Map(prev);
      const item = next.get(key);
      if (item) next.set(key, { ...item, unread: 0 });
      return next;
    });

    try {
      await markRoomReadApi(key);
    } catch (e) {
      console.error(e);
    }
  };

  const clearAll = () => setMap(new Map());

  // items 계산: 원본 변형 없이 캐시 기반으로 roomName만 보강 후 최신순 정렬
  const items = useMemo(() => {
    const arr = Array.from(map.values()).map((it) => {
      const name = it.roomName ?? roomNameMap.current.get(it.roomId);
      return name ? { ...it, roomName: name } : it;
    });
    arr.sort((a, b) => {
      const ta = a.lastMessageAt ? +new Date(a.lastMessageAt) : 0;
      const tb = b.lastMessageAt ? +new Date(b.lastMessageAt) : 0;
      return tb - ta;
    });
    return arr;
  }, [map]);

  const unreadTotal = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.unread) > 0 ? 1 : 0), 0),
    [items]
  );

  const value: Ctx = { unreadTotal, items, markRoomRead, clearAll };
  return (
    <ChatNotifyCtx.Provider value={value}>{children}</ChatNotifyCtx.Provider>
  );
};

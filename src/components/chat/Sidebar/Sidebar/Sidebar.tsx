import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import styles from "./Sidebar.module.css";
import { SidebarList, SearchBar } from "../../../chat";
import { ChatMessage, SidebarListItemData } from "../../../../types";
import { getMyRoomsApi } from "../../../../api/chat";
import {
  eventBus,
  onNewMessage,
  joinRoom,
  bumpUnreadAndSort,
  clearUnread,
  getSocket,
} from "../../../../utils";
import { useParams } from "react-router-dom";
import { useUserStore } from "../../../../store";

type Props = {
  items?: SidebarListItemData[];
  variant: "mine" | "public";
  /** 드로어 컨테이너 내에서 표시할 때 스타일/동작 변형 */
  asDrawer?: boolean;
  /** 항목 선택 시 드로어를 닫기 위해 상위에서 전달 */
  onCloseDrawer?: () => void;
  standalone?: boolean;
};

export const Sidebar = ({
  items = [],
  variant,
  asDrawer,
  onCloseDrawer,
  standalone,
}: Props) => {
  const [query, setQuery] = useState("");
  const [mineRooms, setMineRooms] = useState<SidebarListItemData[]>(items);

  // 이미 조인한 방 기록(중복 조인 방지)
  const joinedRef = useRef<Set<string>>(new Set());
  // 최신 rooms를 재연결 시 사용하기 위한 ref
  const roomsRef = useRef<SidebarListItemData[]>([]);
  roomsRef.current = mineRooms;

  // 현재 방/내 사용자
  const { roomid: currentRoomId } = useParams();
  const myUserId = useUserStore((s) => s.id) ?? undefined;

  // 구독 1회 바인딩을 위한 최신값 ref
  const currentRoomIdRef = useRef<string | undefined>(
    currentRoomId ?? undefined
  );
  const myUserIdRef = useRef<string | undefined>(myUserId);
  useEffect(() => {
    currentRoomIdRef.current = currentRoomId ?? undefined;
  }, [currentRoomId]);
  useEffect(() => {
    myUserIdRef.current = myUserId ?? undefined;
  }, [myUserId]);

  // 내 모든 방 조인
  const joinAllMyRooms = useCallback((rooms: SidebarListItemData[]) => {
    for (const r of rooms) {
      if (!joinedRef.current.has(r.id)) {
        joinRoom(r.id);
        joinedRef.current.add(r.id);
      }
    }
  }, []);

  // 내 방 목록 로드(+전체 조인)
  const refetch = useCallback(async () => {
    try {
      const res = await getMyRoomsApi({ limit: 50 });
      const items: SidebarListItemData[] = res?.data?.items ?? [];
      setMineRooms(items);
      joinAllMyRooms(items);
    } catch (e) {
      console.error("[Sidebar] getMyRoomsApi failed:", e);
    }
  }, [joinAllMyRooms]);

  // 최초 1회 로드
  useEffect(() => {
    refetch();
  }, [refetch]);

  // rooms:refresh → 목록 다시 불러오기
  useEffect(() => {
    const off = eventBus.on("rooms:refresh", () => refetch());
    return () => off();
  }, [refetch]);

  // 읽음 클리어 이벤트 → 배지 0
  useEffect(() => {
    const off = eventBus.on("rooms:clearUnread", (roomId: string) => {
      setMineRooms((prev) => clearUnread(prev, roomId));
    });
    return () => off();
  }, []);

  // 새 메시지 구독(단일 바인딩) → 정렬 + 조건부 unread++
  useEffect(() => {
    const off = onNewMessage((msg: ChatMessage) => {
      if (!joinedRef.current.has(msg.roomId)) {
        joinRoom(msg.roomId);
        joinedRef.current.add(msg.roomId);
      }
      const curRoom = currentRoomIdRef.current;
      const me = myUserIdRef.current;
      setMineRooms((prev) =>
        bumpUnreadAndSort(prev, msg, { currentRoomId: curRoom, myUserId: me })
      );
    });
    return () => {
      typeof off === "function" && off();
    };
  }, []);

  // 소켓 연결/재연결 시 내 모든 방 재조인(조인 유실 방지)
  useEffect(() => {
    const socket = getSocket?.();
    if (!socket) return;
    const onConnect = () => joinAllMyRooms(roomsRef.current);
    const onReconnect = () => joinAllMyRooms(roomsRef.current);
    socket.on("connect", onConnect);
    socket.io?.on("reconnect", onReconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.io?.off("reconnect", onReconnect);
    };
  }, [joinAllMyRooms]);

  // 검색 필터
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mineRooms;
    return mineRooms.filter((r) => r.roomName.toLowerCase().includes(q));
  }, [query, mineRooms]);

  // 드로어 닫기용
  const handleSelect = (roomId: string) => {
    onCloseDrawer?.();
  };

  console.log(asDrawer);
  return (
    <div
      className={[
        styles.sidebar,
        asDrawer ? styles.asDrawer : "",
        standalone ? styles.standalone : "", // ✅
      ].join(" ")}
    >
      <SearchBar onChange={setQuery} onSubmit={setQuery} />
      <div className={styles.listArea}>
        <SidebarList
          items={filtered}
          variant={variant}
          onSelectRoom={handleSelect}
        />
      </div>
    </div>
  );
};

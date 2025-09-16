// src/components/chat/Sidebar.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";
import {
  SidebarList,
  SidebarPublicList,
  SidebarPublicListItem,
  SidebarSearch,
  Toast,
} from "../../../components/chat";
import {
  listPublicRoomsApi,
  joinRoomApi,
  leaveRoomApi,
} from "../../../api/room";
import { useToast } from "../../../hooks/useToast";
import { useRoomsStore } from "../../../store";
import { PublicRoomListItemDto, RoomListItemDto } from "../../../types";
import { toClientRoom } from "../../../utils";

type TabKey = "mine" | "public";

export const Sidebar = () => {
  const { msg, show } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("mine");

  const [pubLoading, setPubLoading] = useState(false);
  const [pubRooms, setPubRooms] = useState<PublicRoomListItemDto[]>([]);
  const [cursor, setCursor] = useState<{
    id: string;
    lastMessageAt: string | null;
  } | null>(null);

  const upsertRoom = useRoomsStore((s) => s.upsertRoom);
  const removeRoomFromStore = useRoomsStore((s) => s.removeRoom);
  const selectRoom = useRoomsStore((s) => s.selectRoom);
  // 1) 스토어에서 원시값만 추출 (배열 생성 X)
  const allIds = useRoomsStore((s) => s.allIds);
  const byId = useRoomsStore((s) => s.byId);

  // 2) 표시용 리스트가 필요하면 여기서만 만드세요 (의존성으로는 쓰지 말기)
  const myRooms = useMemo(() => allIds.map((id) => byId[id]), [allIds, byId]);

  // 3) 포함 체크용 Set은 allIds만으로 충분
  const myRoomIdSet = useMemo(() => new Set(allIds), [allIds]);

  const navigate = useNavigate();

  const loadPublic = async (append = false) => {
    try {
      setPubLoading(true);
      const { items, nextCursor } = await listPublicRoomsApi({
        limit: 30,
        cursor: append ? cursor ?? undefined : undefined,
      });
      setPubRooms((prev) => (append ? [...prev, ...items] : items));
      setCursor(nextCursor ?? null);
    } catch (e: any) {
      show(e?.message || "공개 방을 불러오지 못했습니다.");
    } finally {
      setPubLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "public" && pubRooms.length === 0 && !pubLoading) {
      loadPublic(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleJoin = async (roomId: string) => {
    try {
      const room: RoomListItemDto = await joinRoomApi(roomId);
      // 내 방 스토어 업데이트
      upsertRoom(toClientRoom(room));
      // 공개 목록의 memberCount 증가(낙관적)
      setPubRooms((list) =>
        list.map((it) =>
          it.id === roomId
            ? {
                ...it,
                memberCount:
                  typeof it.memberCount === "number" ? it.memberCount + 1 : 1,
              }
            : it
        )
      );
      show("채팅방에 가입했어요.");
      setActiveTab("mine");
      selectRoom(room.id);
      navigate(`/chat/${room.id}`);
    } catch (e: any) {
      show(e?.message || "가입에 실패했습니다.");
    }
  };

  const handleLeave = async (roomId: string) => {
    try {
      await leaveRoomApi(roomId);
      // 내 방 스토어에서 제거
      removeRoomFromStore(roomId);
      // 공개 목록의 memberCount 감소(낙관적, 0 밑으로는 내려가지 않게)
      setPubRooms((list) =>
        list.map((it) =>
          it.id === roomId
            ? {
                ...it,
                memberCount:
                  typeof it.memberCount === "number"
                    ? Math.max(0, it.memberCount - 1)
                    : 0,
              }
            : it
        )
      );
      show("채팅방에서 탈퇴했어요.");
      // 필요 시: 현재 선택된 방이 탈퇴한 방이면 선택 해제/다른 방으로 이동 처리
    } catch (e: any) {
      show(e?.message || "탈퇴에 실패했습니다.");
    }
  };

  return (
    <div className={styles.sidebar}>
      <Toast message={msg} />

      <div className={styles.searchArea}>
        <SidebarSearch />
      </div>

      <div className={styles.tabs} role="tablist" aria-label="채팅방 탭">
        <button
          role="tab"
          aria-selected={activeTab === "mine"}
          className={`${styles.tab} ${
            activeTab === "mine" ? styles.tabActive : ""
          }`}
          onClick={() => setActiveTab("mine")}
        >
          내 방
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "public"}
          className={`${styles.tab} ${
            activeTab === "public" ? styles.tabActive : ""
          }`}
          onClick={() => setActiveTab("public")}
        >
          공개 방
        </button>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.listArea}>
        {activeTab === "mine" ? (
          <SidebarList />
        ) : (
          <SidebarPublicList
            loading={pubLoading}
            rooms={pubRooms}
            onRefresh={() => loadPublic(false)}
            onLoadMore={() => loadPublic(true)}
            hasMore={!!cursor}
            renderItem={(item) => (
              <SidebarPublicListItem
                key={item.id}
                item={item}
                isJoined={myRoomIdSet.has(item.id)}
                onJoin={handleJoin}
                onLeave={handleLeave}
              />
            )}
          />
        )}
      </div>
    </div>
  );
};

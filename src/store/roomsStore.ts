import { create } from "zustand";
import type { ChatroomListItem } from "../types";
import { mockItems } from "../data/chat.mock"; // TODO: Mock 데이터 제거 시 이 import 삭제

export type RoomsState = {
  byId: Record<string, ChatroomListItem>;
  allIds: string[]; // 정렬된 id 목록
  cursor: string | null; // 무한스크롤 커서
  loading: boolean;
  error: string | null;
  q: string; // 검색어(옵션)

  // actions
  selectedId: string | null;
  selectRoom: (id: string) => void;
  replaceRooms: (payload: {
    items: ChatroomListItem[];
    nextCursor?: string | null;
  }) => void;
  appendRooms: (payload: {
    items: ChatroomListItem[];
    nextCursor?: string | null;
  }) => void;
  upsertRoom: (room: ChatroomListItem) => void;
  removeRoom: (id: string) => void;
  setLoading: (b: boolean) => void;
  setError: (m: string | null) => void;
  setCursor: (c: string | null) => void;
  setQuery: (q: string) => void;
};

const sortRooms = (a: ChatroomListItem, b: ChatroomListItem) => {
  if ((a.isPinned ?? false) !== (b.isPinned ?? false)) {
    return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
  }
  const ta = a.lastMessageAt ? Date.parse(a.lastMessageAt as any) || 0 : 0;
  const tb = b.lastMessageAt ? Date.parse(b.lastMessageAt as any) || 0 : 0;
  if (ta !== tb) return tb - ta;
  return a.roomName.localeCompare(b.roomName);
};


export const useRoomsStore = create<RoomsState>((set, get) => ({
  byId: {},  
  allIds: [], 
  cursor: null,
  loading: false,
  error: null,
  q: "",

  selectedId: null,
  selectRoom: (id) => {
    const st = get();
    // 선택 상태 저장
    let byId = st.byId;

    // (옵션) 선택과 동시에 미읽음 뱃지 제거(낙관적)
    if (byId[id] && (byId[id] as any).unreadCount > 0) {
      byId = { ...byId, [id]: { ...byId[id], unreadCount: 0 } };
    }

    set({ selectedId: id, byId });
  },
  replaceRooms: ({ items, nextCursor = null }) => {
    const byId: Record<string, ChatroomListItem> = {};
    for (const r of items) byId[r.id] = r;
    const allIds = [...items].sort(sortRooms).map((r) => r.id);
    set({ byId, allIds, cursor: nextCursor, error: null });
  },

  appendRooms: ({ items, nextCursor = null }) => {
    const st = get();
    const byId: Record<string, ChatroomListItem> = { ...st.byId };
    for (const r of items) byId[r.id] = r;
    const allIds = Object.values(byId)
      .sort(sortRooms)
      .map((r) => r.id);
    set({ byId, allIds, cursor: nextCursor });
  },

  upsertRoom: (room) => {
    const st = get();
    const byId = { ...st.byId, [room.id]: { ...st.byId[room.id], ...room } };
    const allIds = Object.values(byId)
      .sort(sortRooms)
      .map((r) => r.id);
    set({ byId, allIds });
  },

  removeRoom: (id) => {
    const st = get();
    if (!st.byId[id]) return;
    const byId = { ...st.byId };
    delete byId[id];
    const allIds = st.allIds.filter((x) => x !== id);
    set({ byId, allIds });
  },

  setLoading: (b) => set({ loading: b }),
  setError: (m) => set({ error: m }),
  setCursor: (c) => set({ cursor: c }),
  setQuery: (q) => set({ q }),
}));

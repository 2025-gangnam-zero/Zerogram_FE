import { create } from "zustand";
import type { ChatroomListItem, CursorPayload } from "../types";
import { useUserStore } from "./userStore";

export type RoomsState = {
  byId: Record<string, ChatroomListItem>;
  allIds: string[]; // 정렬된 id 목록
  cursor?: CursorPayload | null; // 무한스크롤 커서
  loading: boolean;
  error: string | null;
  q: string; // 검색어(옵션)

  // actions
  selectedId: string | null;
  selectRoom: (id: string) => void;
  replaceRooms: (payload: {
    items: ChatroomListItem[];
    nextCursor?: CursorPayload | null;
  }) => void;
  appendRooms: (payload: {
    items: ChatroomListItem[];
    nextCursor?: CursorPayload | null;
  }) => void;
  upsertRoom: (room: ChatroomListItem) => void;
  removeRoom: (id: string) => void;
  setLoading: (b: boolean) => void;
  setError: (m: string | null) => void;
  setCursor: (c: CursorPayload | null) => void;
  setQuery: (q: string) => void;
  updateRoomSummary(e: {
    id: string;
    lastMessage?: string | null;
    lastMessageAt?: string | null;
    memberCount?: number;
    seqCounter: number;
  }): void;
  applyReadUpdated(e: {
    roomId: string;
    userId: string;
    lastReadSeq: number;
    lastReadAt: string;
  }): void;
  patchRoom(
    roomId: string,
    patch: { notice?: string | null; memberCount?: number }
  ): void;
};

/** 안전한 시간 파싱 (ISO string | null | undefined -> number) */
const ts = (iso?: string | null): number => {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
};

/** 고정핀 우선 -> 최신 메시지 시각 내림차순 -> 이름 사전순 */
const sortRooms = (a: ChatroomListItem, b: ChatroomListItem) => {
  const ap = a.isPinned ?? false;
  const bp = b.isPinned ?? false;
  if (ap !== bp) return bp ? 1 : -1;

  const ta = ts(a.lastMessageAt);
  const tb = ts(b.lastMessageAt);
  if (ta !== tb) return tb - ta;

  return a.roomName.localeCompare(b.roomName);
};

const computeUnread = (seqCounter?: number, lastReadSeq?: number) =>
  Math.max(0, (seqCounter ?? 0) - (lastReadSeq ?? 0));

export const useRoomsStore = create<RoomsState>((set, get) => ({
  byId: {},
  allIds: [],
  cursor: null,
  loading: false,
  error: null,
  q: "",

  selectedId: null,

  /** 방 선택 시(옵션) unreadCount를 0으로 낙관적 반영 */
  selectRoom: (id) => {
    const st = get();
    const cur = st.byId[id];
    if (!cur) {
      set({ selectedId: id });
      return;
    }
    const nextById: Record<string, ChatroomListItem> = {
      ...st.byId,
      [id]: { ...cur, unreadCount: 0 },
    };
    set({ selectedId: id, byId: nextById });
  },

  /** 목록 교체 */
  replaceRooms: ({ items, nextCursor = null }) => {
    const byId: Record<string, ChatroomListItem> = {};
    for (const r of items) byId[r.id] = r;
    const allIds = [...items].sort(sortRooms).map((r) => r.id);
    set({ byId, allIds, cursor: nextCursor, error: null });
  },

  /** 목록 뒤에 합치기(중복 upsert 후 전체 정렬) */
  appendRooms: ({ items, nextCursor = null }) => {
    const st = get();
    const byId: Record<string, ChatroomListItem> = { ...st.byId };
    for (const r of items) byId[r.id] = r;
    const allIds = Object.values(byId)
      .sort(sortRooms)
      .map((r) => r.id);
    set({ byId, allIds, cursor: nextCursor });
  },

  /** 단건 upsert 후 정렬 갱신 */
  upsertRoom: (room) => {
    const st = get();
    const byId: Record<string, ChatroomListItem> = {
      ...st.byId,
      [room.id]: { ...st.byId[room.id], ...room },
    };
    const allIds = Object.values(byId)
      .sort(sortRooms)
      .map((r) => r.id);
    set({ byId, allIds });
  },

  /** 단건 제거 */
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

  updateRoomSummary: (e) => {
    const st = get();
    const cur =
      st.byId[e.id] ?? ({ id: e.id, roomName: "" } as ChatroomListItem);

    const next: ChatroomListItem = {
      ...cur,
      lastMessage: e.lastMessage ?? cur.lastMessage ?? null,
      lastMessageAt: e.lastMessageAt ?? cur.lastMessageAt ?? null,
      memberCount: e.memberCount ?? cur.memberCount,
      seqCounter: e.seqCounter, // 서버 최신
    };
    next.unreadCount = computeUnread(next.seqCounter, next.lastReadSeq);

    const byId = { ...st.byId, [e.id]: next };
    const allIds = Object.values(byId)
      .sort(sortRooms)
      .map((r) => r.id);
    set({ byId, allIds });
  },

  applyReadUpdated: (e) => {
    // 내 이벤트만 반영
    const selfId = useUserStore.getState().id;
    if (!selfId || e.userId !== selfId) return;

    const st = get();
    const cur = st.byId[e.roomId];
    if (!cur) return;

    const next: ChatroomListItem = {
      ...cur,
      lastReadSeq: e.lastReadSeq,
    };
    next.unreadCount = computeUnread(next.seqCounter, next.lastReadSeq);

    const byId = { ...st.byId, [e.roomId]: next };
    // lastMessageAt 변동 없으니 정렬은 동일하지만, 일관성을 위해 재계산 가능
    const allIds = Object.values(byId)
      .sort(sortRooms)
      .map((r) => r.id);
    set({ byId, allIds });
  },

  patchRoom: (roomId, patch) => {
    const st = get();
    const cur = st.byId[roomId];
    if (!cur) return;

    const next: ChatroomListItem = { ...cur, ...patch };
    // notice/memberCount만 바뀌면 정렬 영향 없음(원하면 정렬 유지)
    const byId = { ...st.byId, [roomId]: next };
    const allIds = Object.values(byId)
      .sort(sortRooms)
      .map((r) => r.id);
    set({ byId, allIds });
  },
}));

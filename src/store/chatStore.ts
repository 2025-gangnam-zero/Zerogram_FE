// stores/chatRooms.ts
import { create } from "zustand";
import { ChatMessage } from "../types";
import { getMessagesApi } from "../api/chat";
import { normalizeAscending } from "../utils";

type RoomState = {
  messages: ChatMessage[];
  hasMore: boolean;
  cursorSeq: number | null; // 다음 프리펜드용 beforeSeq
  loaded: boolean; // 초기 로드 완료 여부
  loading: boolean; // 현재 로딩 중
};

type ScrollAnchor = {
  anchorId: string | null;
  offset: number;
  wasAtBottom: boolean;
  updatedAt: number;
};

type ChatRoomsState = {
  rooms: Record<string, RoomState>;
  anchors: Record<string, ScrollAnchor | undefined>;

  // 액션
  ensureRoom: (roomId: string) => void;
  loadInitial: (roomId: string, pageSize: number) => Promise<void>;
  prependOlder: (roomId: string, pageSize: number) => Promise<void>;
  appendMessage: (roomId: string, msg: ChatMessage) => void;

  setAnchor: (roomId: string, a: ScrollAnchor) => void;
  getAnchor: (roomId: string) => ScrollAnchor | undefined;

  // (선택) 메모리 관리
  evictOthers: (keepRoomIds: string[]) => void;
};

export const useChatStore = create<ChatRoomsState>((set, get) => ({
  rooms: {},
  anchors: {},

  ensureRoom: (roomId) => {
    const { rooms } = get();
    if (!rooms[roomId]) {
      set({
        rooms: {
          ...rooms,
          [roomId]: {
            messages: [],
            hasMore: true,
            cursorSeq: null,
            loaded: false,
            loading: false,
          },
        },
      });
    }
  },

  loadInitial: async (roomId, pageSize) => {
    const { rooms } = get();
    const r = rooms[roomId];
    if (r?.loaded || r?.loading) return; // 이미 있으면 그대로 사용해 빠른 전환
    get().ensureRoom(roomId);

    set((s) => ({
      rooms: {
        ...s.rooms,
        [roomId]: { ...s.rooms[roomId], loading: true },
      },
    }));

    try {
      const res = await getMessagesApi(roomId, { limit: pageSize });
      const items: ChatMessage[] = res?.data?.items ?? [];
      const orderedAsc = normalizeAscending(items);
      set((s) => ({
        rooms: {
          ...s.rooms,
          [roomId]: {
            messages: orderedAsc,
            hasMore: items.length === pageSize,
            cursorSeq: orderedAsc.length
              ? (orderedAsc[0] as any).seq ?? null
              : null,
            loaded: true,
            loading: false,
          },
        },
      }));
    } catch {
      set((s) => ({
        rooms: {
          ...s.rooms,
          [roomId]: {
            ...(s.rooms[roomId] ?? {}),
            loading: false,
            loaded: true,
          },
        },
      }));
    }
  },

  prependOlder: async (roomId, pageSize) => {
    const { rooms } = get();
    const r = rooms[roomId];
    if (!r || r.loading || !r.hasMore || r.cursorSeq == null) return;

    set((s) => ({
      rooms: {
        ...s.rooms,
        [roomId]: { ...s.rooms[roomId], loading: true },
      },
    }));

    try {
      const res = await getMessagesApi(roomId, {
        limit: pageSize,
        beforeSeq: r.cursorSeq,
      });
      const items: ChatMessage[] = res?.data?.items ?? [];
      const olderAsc = normalizeAscending(items);

      set((s) => {
        const cur = s.rooms[roomId];
        const nextMsgs = olderAsc.length
          ? [...olderAsc, ...cur.messages]
          : cur.messages;
        return {
          rooms: {
            ...s.rooms,
            [roomId]: {
              ...cur,
              messages: nextMsgs,
              cursorSeq: olderAsc.length
                ? (olderAsc[0] as any).seq ?? cur.cursorSeq
                : cur.cursorSeq,
              hasMore: items.length === pageSize,
              loading: false,
            },
          },
        };
      });
    } catch {
      set((s) => ({
        rooms: {
          ...s.rooms,
          [roomId]: { ...s.rooms[roomId], loading: false },
        },
      }));
    }
  },

  appendMessage: (roomId, msg) => {
    set((s) => {
      const r = s.rooms[roomId];
      if (!r) return s;
      return {
        rooms: {
          ...s.rooms,
          [roomId]: { ...r, messages: [...r.messages, msg] },
        },
      };
    });
  },

  setAnchor: (roomId, a) =>
    set((s) => ({ anchors: { ...s.anchors, [roomId]: a } })),
  getAnchor: (roomId) => get().anchors[roomId],

  evictOthers: (keep) => {
    set((s) => {
      const next: Record<string, RoomState> = {};
      keep.forEach((id) => {
        if (s.rooms[id]) next[id] = s.rooms[id];
      });
      return { rooms: next };
    });
  },
}));

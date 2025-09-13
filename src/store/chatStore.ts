import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { persist } from "zustand/middleware";
import {
  Room,
  RoomMember,
  Message,
  LastMessage,
  CHThread,
} from "../types/chat";

/** ---------- 공통 유틸 ---------- */
const toLastMessage = (m: Message): LastMessage => ({
  id: m.id,
  author: { id: m.authorId, name: m.authorName },
  type: "text", // 서버에서 타입 내려주면 그걸로 분기 가능
  text: m.content,
  createdAt: m.createdAt,
});

/** ---------- Rooms Slice ---------- */
type RoomsSlice = {
  roomsById: Record<string, Room>;
  roomOrder: string[]; // 사이드바 정렬
  activeRoomId?: string;

  setRooms: (rooms: Room[]) => void;
  upsertRoom: (room: Room) => void;
  setActiveRoom: (roomId: string) => void;
};

const createRoomsSlice = (set: any, get: any): RoomsSlice => ({
  roomsById: {},
  roomOrder: [],
  activeRoomId: undefined,

  setRooms: (rooms) =>
    set((s: RootState) => {
      const next = { ...s.roomsById };
      rooms.forEach((r) => (next[r.id] = r));
      return { roomsById: next, roomOrder: rooms.map((r) => r.id) };
    }),

  upsertRoom: (room) =>
    set((s: RootState) => ({
      roomsById: { ...s.roomsById, [room.id]: room },
      roomOrder: s.roomOrder.includes(room.id)
        ? s.roomOrder
        : [room.id, ...s.roomOrder],
    })),

  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),
});

/** ---------- Members Slice ---------- */
type MembersSlice = {
  membersByRoomId: Record<string, RoomMember[]>;
  setMembers: (roomId: string, members: RoomMember[]) => void;
  upsertMember: (roomId: string, member: RoomMember) => void;
  removeMember: (roomId: string, userId: string) => void;
};

const createMembersSlice = (set: any, get: any): MembersSlice => ({
  membersByRoomId: {},

  setMembers: (roomId, members) =>
    set((s: RootState) => ({
      membersByRoomId: { ...s.membersByRoomId, [roomId]: members },
    })),

  upsertMember: (roomId, member) =>
    set((s: RootState) => {
      const list = s.membersByRoomId[roomId] ?? [];
      const i = list.findIndex((m) => m.user.id === member.user.id);
      const next =
        i >= 0
          ? [...list.slice(0, i), member, ...list.slice(i + 1)]
          : [...list, member];
      return { membersByRoomId: { ...s.membersByRoomId, [roomId]: next } };
    }),

  removeMember: (roomId, userId) =>
    set((s: RootState) => {
      const list = s.membersByRoomId[roomId] ?? [];
      const next = list.filter((m) => m.user.id !== userId);
      return { membersByRoomId: { ...s.membersByRoomId, [roomId]: next } };
    }),
});

/** ---------- Messages Slice ---------- */
type MessagesSlice = {
  messagesById: Record<string, Message>;
  messageIdsByRoomId: Record<string, string[]>; // 정렬: createdAt 오름차순
  beforeCursorByRoomId: Record<string, string | undefined>;

  setInitialMessages: (roomId: string, messages: Message[]) => void;
  prependMessages: (roomId: string, older: Message[], cursor?: string) => void;
  receiveNewMessage: (roomId: string, m: Message) => void;
  editMessage: (msgId: string, patch: Partial<Message>) => void;
  deleteMessage: (msgId: string) => void;
};

const createMessagesSlice = (set: any, get: any): MessagesSlice => ({
  messagesById: {},
  messageIdsByRoomId: {},
  beforeCursorByRoomId: {},

  setInitialMessages: (roomId, messages) =>
    set((s: RootState) => {
      const ids = [...messages]
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((m) => m.id);
      const nextEntities = { ...s.messagesById };
      messages.forEach((m) => (nextEntities[m.id] = m));
      return {
        messagesById: nextEntities,
        messageIdsByRoomId: { ...s.messageIdsByRoomId, [roomId]: ids },
      };
    }),

  prependMessages: (roomId, older, cursor) =>
    set((s: RootState) => {
      const prevIds = s.messageIdsByRoomId[roomId] ?? [];
      const nextEntities = { ...s.messagesById };
      older.forEach((m) => (nextEntities[m.id] = m));
      const newIds = [...older]
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((m) => m.id);
      return {
        messagesById: nextEntities,
        messageIdsByRoomId: {
          ...s.messageIdsByRoomId,
          [roomId]: [...newIds, ...prevIds],
        },
        beforeCursorByRoomId: { ...s.beforeCursorByRoomId, [roomId]: cursor },
      };
    }),

  receiveNewMessage: (roomId, m) =>
    set((s: RootState) => {
      const ids = s.messageIdsByRoomId[roomId] ?? [];
      if (ids.includes(m.id)) {
        // 이미 존재
        return { messagesById: { ...s.messagesById, [m.id]: m } };
      }
      return {
        messagesById: { ...s.messagesById, [m.id]: m },
        messageIdsByRoomId: {
          ...s.messageIdsByRoomId,
          [roomId]: [...ids, m.id],
        },
      };
    }),

  editMessage: (msgId, patch) =>
    set((s: RootState) => ({
      messagesById: {
        ...s.messagesById,
        [msgId]: { ...s.messagesById[msgId], ...patch },
      },
    })),

  deleteMessage: (msgId) =>
    set((s: RootState) => {
      const next = { ...s.messagesById };
      delete next[msgId];
      // room별 id 배열에서 제거
      const idsMap = Object.fromEntries(
        Object.entries(s.messageIdsByRoomId).map(([rid, ids]) => [
          rid,
          ids.filter((id) => id !== msgId),
        ])
      );
      return { messagesById: next, messageIdsByRoomId: idsMap };
    }),
});

/** ---------- Receipts/읽음 Slice ---------- */
/* 정책: 서버가 viewer 기준으로 계산한 값을 내려줌.
   - 방 단위 뱃지: unreadCountByRoom
   - 메시지 단위 뱃지: message.unreadOthers (옵션) */
/** ---------- Receipts/읽음 Slice ---------- */
/* 정책: 서버가 viewer 기준으로 계산한 값을 내려줌.
   - 방 단위 뱃지: unreadCountByRoom
   - 메시지 단위 뱃지: unreadOthers (별도 맵으로 관리) */
type ReceiptsSlice = {
  lastReadAtByRoom: Record<string, number>;
  unreadCountByRoom: Record<string, number>;

  // ➕ 메시지별 안읽음 수(나 제외/작성자 제외는 서버에서 계산)
  unreadOthersByMessageId: Record<string, number>;

  setRoomUnread: (roomId: string, count: number) => void;
  setLastReadAt: (roomId: string, ts: number) => void;
  markRead: (roomId: string, upTo: number) => void;

  // ➕ 서버 푸시/응답 반영
  applyMessageReceipts: (msgId: string, unreadOthers: number) => void;
  applyMessageReceiptsBulk: (
    items: Array<{ msgId: string; unreadOthers: number }>
  ) => void;
};

const createReceiptsSlice = (set: any, get: any): ReceiptsSlice => ({
  lastReadAtByRoom: {},
  unreadCountByRoom: {},

  // ➕ 초기값
  unreadOthersByMessageId: {},

  setRoomUnread: (roomId, count) =>
    set((s: RootState) => ({
      unreadCountByRoom: { ...s.unreadCountByRoom, [roomId]: count },
    })),

  setLastReadAt: (roomId, ts) =>
    set((s: RootState) => ({
      lastReadAtByRoom: { ...s.lastReadAtByRoom, [roomId]: ts },
    })),

  markRead: (roomId, upTo) =>
    set((s: RootState) => ({
      lastReadAtByRoom: { ...s.lastReadAtByRoom, [roomId]: upTo },
      unreadCountByRoom: { ...s.unreadCountByRoom, [roomId]: 0 },
    })),

  // ➕ 단건/벌크 갱신
  applyMessageReceipts: (msgId, unreadOthers) =>
    set((s: RootState) => ({
      unreadOthersByMessageId: {
        ...s.unreadOthersByMessageId,
        [msgId]: unreadOthers,
      },
    })),

  applyMessageReceiptsBulk: (items) =>
    set((s: RootState) => {
      const next = { ...s.unreadOthersByMessageId };
      items.forEach(({ msgId, unreadOthers }) => {
        next[msgId] = unreadOthers;
      });
      return { unreadOthersByMessageId: next };
    }),
});

/** ---------- Chat UI Slice (초안/스케치만) ---------- */
type ChatUiSlice = {
  draftByRoomId: Record<string, string>;
  isDndDragging: boolean;
  setDraft: (roomId: string, text: string) => void;
  clearDraft: (roomId: string) => void;
  setDndDragging: (on: boolean) => void;
};

const createChatUiSlice = (set: any, get: any): ChatUiSlice => ({
  draftByRoomId: {},
  isDndDragging: false,

  setDraft: (roomId, text) =>
    set((s: RootState) => ({
      draftByRoomId: { ...s.draftByRoomId, [roomId]: text },
    })),
  clearDraft: (roomId) =>
    set((s: RootState) => {
      const next = { ...s.draftByRoomId };
      delete next[roomId];
      return { draftByRoomId: next };
    }),
  setDndDragging: (on) => set({ isDndDragging: on }),
});

/** ---------- 루트 상태/스토어 ---------- */
export type RootState = RoomsSlice &
  MembersSlice &
  MessagesSlice &
  ReceiptsSlice &
  ChatUiSlice & {
    // 파생 셀렉터들 (state 내부에 함수를 두면 devtools에서 보기 좋음)
    selectThreads: () => CHThread[];
    selectMessages: (roomId: string) => Message[];
    selectActiveRoom: () => Room | undefined;
    selectMembers: (roomId: string) => RoomMember[];
    selectUnreadOthers: (msgId: string) => number;
  };

export const useChatStore = create<RootState>()(
  devtools(
    persist(
      (set, get) => ({
        /** slices */
        ...createRoomsSlice(set, get),
        ...createMembersSlice(set, get),
        ...createMessagesSlice(set, get),
        ...createReceiptsSlice(set, get),
        ...createChatUiSlice(set, get),

        /** ---------- 파생 셀렉터 ---------- */
        selectThreads: () => {
          const s = get();
          return s.roomOrder.map<CHThread>((roomId) => {
            const room = s.roomsById[roomId];
            const ids = s.messageIdsByRoomId[roomId] ?? [];
            const last = ids.length
              ? s.messagesById[ids[ids.length - 1]]
              : undefined;
            return {
              id: roomId,
              room,
              lastMessage: last ? toLastMessage(last) : undefined,
              unreadCount: s.unreadCountByRoom[roomId] ?? 0,
            };
          });
        },

        selectMessages: (roomId: string) => {
          const s = get();
          const ids = s.messageIdsByRoomId[roomId] ?? [];
          return ids.map((id) => s.messagesById[id]).filter(Boolean);
        },

        selectActiveRoom: () => {
          const s = get();
          return s.activeRoomId ? s.roomsById[s.activeRoomId] : undefined;
        },

        selectMembers: (roomId: string) => {
          const s = get();
          return s.membersByRoomId[roomId] ?? [];
        },

        selectUnreadOthers: (msgId: string) => {
          const s = get();
          return s.unreadOthersByMessageId[msgId] ?? 0;
        },
      }),
      {
        name: "chat-store",
        // 영속할 최소 키만 부분 저장(초안/활성 방)
        partialize: (s) => ({
          activeRoomId: s.activeRoomId,
          draftByRoomId: s.draftByRoomId,
          roomOrder: s.roomOrder,
          roomsById: s.roomsById, // 방 메타는 가벼워서 포함 (선호에 따라 제외 가능)
        }),
      }
    )
  )
);

// src/stores/chatData.ts
import { create } from "zustand";
import type { ChatMessage, MessagesByRoom } from "../types/chat";
import type { ChatroomListItem } from "../types";

const fmtTime = (d = new Date()) => {
  const h = d.getHours(),
    m = String(d.getMinutes()).padStart(2, "0");
  const isAM = h < 12,
    hh = h % 12 === 0 ? 12 : h % 12;
  return `${isAM ? "오전" : "오후"} ${hh}:${m}`;
};

type RoomMap = Record<string, ChatroomListItem>;
type ReadState = Record<string, { unreadCount: number }>;

type ChatDataState = {
  currentUserId: string;
  selectedRoomId?: string;
  rooms: RoomMap;
  roomOrder: string[];
  messagesByRoom: MessagesByRoom;
  readState: ReadState;

  // selectors
  getRoomsList: () => (ChatroomListItem & { unreadCount: number })[];
  getRoom: (id?: string) => ChatroomListItem | undefined;
  getMessages: (roomId?: string) => ChatMessage[];

  // init
  bootstrap: (rooms: ChatroomListItem[], messages: MessagesByRoom) => void;

  // interactions
  selectRoom: (roomId: string) => void;
  pinRoom: (roomId: string, pinned: boolean) => void;
  updateRoom: (patch: Partial<ChatroomListItem> & { id: string }) => void;

  // messages
  addMessage: (
    roomId: string,
    input: Omit<ChatMessage, "roomId" | "createdAt"> & { createdAt?: string }
  ) => ChatMessage;
  markRoomRead: (roomId: string) => void;

  clearAll: () => void;
};

export const useChatDataStore = create<ChatDataState>((set, get) => ({
  currentUserId: "me",
  selectedRoomId: undefined,
  rooms: {},
  roomOrder: [],
  messagesByRoom: {},
  readState: {},

  // selectors
  getRoomsList: () => {
    const s = get();
    return s.roomOrder
      .map((id) => s.rooms[id])
      .filter(Boolean)
      .map((r) => ({
        ...r!,
        unreadCount: s.readState[r!.id]?.unreadCount ?? 0,
      }));
  },
  getRoom: (id) => (id ? get().rooms[id] : undefined),
  getMessages: (roomId) => (roomId ? get().messagesByRoom[roomId] ?? [] : []),

  // init
  bootstrap: (rooms, messages) =>
    set(() => {
      const map: RoomMap = {};
      const order: string[] = [];
      const rs: ReadState = {};
      rooms.forEach((r) => {
        map[r.id] = r;
        order.push(r.id);
        rs[r.id] = { unreadCount: (r as any).unreadCount ?? 0 };
      });
      return {
        rooms: map,
        roomOrder: order,
        messagesByRoom: messages,
        readState: rs,
        selectedRoomId: rooms[0]?.id,
      };
    }),

  // interactions
  selectRoom: (roomId) =>
    set((s) => {
      if (s.selectedRoomId === roomId) return s; // no-op
      const cur = s.readState[roomId]?.unreadCount ?? 0;
      return {
        selectedRoomId: roomId,
        readState: cur
          ? { ...s.readState, [roomId]: { unreadCount: 0 } }
          : s.readState,
      };
    }),

  pinRoom: (roomId, pinned) =>
    set((s) => {
      const r = s.rooms[roomId];
      if (!r || r.isPinned === pinned) return s; // no-op
      return { rooms: { ...s.rooms, [roomId]: { ...r, isPinned: pinned } } };
    }),

  updateRoom: (patch) =>
    set((s) => {
      const prev = s.rooms[patch.id];
      if (!prev) return s;
      const next = { ...prev, ...patch };
      // 얕은 비교 최소화 (필요 시 더 정교하게)
      if (
        prev.roomName === next.roomName &&
        prev.memberCount === next.memberCount &&
        prev.memberCapacity === next.memberCapacity &&
        prev.isPinned === next.isPinned &&
        prev.lastMessage === next.lastMessage &&
        prev.lastMessageAt === next.lastMessageAt
      ) {
        return s;
      }
      return { rooms: { ...s.rooms, [patch.id]: next } };
    }),

  // messages
  addMessage: (roomId, input) => {
    const createdAt = input.createdAt ?? fmtTime();
    const msg: ChatMessage = { ...input, roomId, createdAt };

    set((s) => {
      const list = s.messagesByRoom[roomId] ?? [];
      const nextList = [...list, msg];

      // 방 미리보기 업데이트
      const room = s.rooms[roomId];
      const lastPreview =
        msg.content && msg.content.trim().length
          ? msg.content
          : msg.images?.length
          ? `이미지 ${msg.images.length}장`
          : room?.lastMessage ?? "";

      return {
        messagesByRoom: { ...s.messagesByRoom, [roomId]: nextList },
        rooms: room
          ? {
              ...s.rooms,
              [roomId]: {
                ...room,
                lastMessage: lastPreview,
                lastMessageAt: createdAt,
              },
            }
          : s.rooms,
      };
    });

    return msg;
  },

  markRoomRead: (roomId) =>
    set((s) => {
      if ((s.readState[roomId]?.unreadCount ?? 0) === 0) return s; // no-op
      return { readState: { ...s.readState, [roomId]: { unreadCount: 0 } } };
    }),

  clearAll: () =>
    set(() => ({
      selectedRoomId: undefined,
      rooms: {},
      roomOrder: [],
      messagesByRoom: {},
      readState: {},
    })),
}));

import { create as createZ } from "zustand";
import type { ChatMessage } from "../types";
import { mockMessages } from "../data/chat.mock"; // TODO: Mock 데이터 제거 시 이 import 삭제

export type RoomMessages = {
  items: ChatMessage[]; // 오래된 → 최신 정렬 유지
  nextBeforeId: string | null; // 과거 페이지 커서
};

export type MessagesState = {
  byRoomId: Record<string, RoomMessages>;

  setPage: (
    roomId: string,
    page: { items: ChatMessage[]; nextBeforeId: string | null }
  ) => void;
  prependOlder: (
    roomId: string,
    older: { items: ChatMessage[]; nextBeforeId: string | null }
  ) => void;
  addMessage: (roomId: string, msg: ChatMessage) => void; // 새 메시지(보통 끝에)
  updateMessage: (
    roomId: string,
    msgId: string,
    patch: Partial<ChatMessage>
  ) => void;
  removeMessage: (roomId: string, msgId: string) => void;
  clearRoom: (roomId: string) => void;
};


const initialByRoomId = {};


export const useMessagesStore = createZ<MessagesState>((set, get) => ({
  byRoomId: {},

  setPage: (roomId, page) =>
    set((st) => ({ byRoomId: { ...st.byRoomId, [roomId]: { ...page } } })),

  prependOlder: (roomId, older) =>
    set((st) => {
      const curr = st.byRoomId[roomId] ?? { items: [], nextBeforeId: null };
      return {
        byRoomId: {
          ...st.byRoomId,
          [roomId]: {
            items: [...older.items, ...curr.items],
            nextBeforeId: older.nextBeforeId,
          },
        },
      };
    }),

  addMessage: (roomId, msg) =>
    set((st) => {
      const curr = st.byRoomId[roomId] ?? { items: [], nextBeforeId: null };
      // 중복 방지(같은 id)
      if (curr.items.find((m) => m.id === msg.id)) return st;
      return {
        byRoomId: {
          ...st.byRoomId,
          [roomId]: { ...curr, items: [...curr.items, msg] },
        },
      };
    }),

  updateMessage: (roomId, msgId, patch) =>
    set((st) => {
      const curr = st.byRoomId[roomId];
      if (!curr) return st;
      return {
        byRoomId: {
          ...st.byRoomId,
          [roomId]: {
            ...curr,
            items: curr.items.map((m) =>
              m.id === msgId ? { ...m, ...patch } : m
            ),
          },
        },
      };
    }),

  removeMessage: (roomId, msgId) =>
    set((st) => {
      const curr = st.byRoomId[roomId];
      if (!curr) return st;
      return {
        byRoomId: {
          ...st.byRoomId,
          [roomId]: {
            ...curr,
            items: curr.items.filter((m) => m.id !== msgId),
          },
        },
      };
    }),

  clearRoom: (roomId) =>
    set((st) => {
      if (!st.byRoomId[roomId]) return st;
      const cloned = { ...st.byRoomId };
      delete cloned[roomId];
      return { byRoomId: cloned };
    }),
}));

import { create } from "zustand";
import type { ChatMessage, MessagesByRoom } from "../types/chat";
import { mockMessages } from "../data/chat.mock";

type MessagesState = {
  byRoom: MessagesByRoom;
  addMessage: (roomId: string, msg: ChatMessage) => void;
};

export const useMessagesStore = create<MessagesState>((set) => ({
  byRoom: mockMessages, // 초기 시드
  addMessage: (roomId, msg) =>
    set((s) => ({
      byRoom: {
        ...s.byRoom,
        [roomId]: [...(s.byRoom[roomId] ?? []), msg],
      },
    })),
}));

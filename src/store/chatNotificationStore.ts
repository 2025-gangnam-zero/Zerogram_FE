// src/store/notifications.ts
import { create } from "zustand";

export type ChatNotification = {
  id: string;
  type: "message" | "mention";
  title: string;
  messageContent: string;
  roomId: string;
  roomThumbnail?: string;
  url?: string; // 예: `/chat/${roomId}`
  createdAt: number; // epoch ms
  read: boolean;
};

type State = {
  items: ChatNotification[];
  setAll: (list: ChatNotification[]) => void;
  add: (n: ChatNotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  unreadCount: () => number;
};

export const useChatNotificationStore = create<State>((set, get) => ({
  items: [],
  setAll: (list) => set({ items: list }),
  add: (n) => set((s) => ({ items: [n, ...s.items] })),
  markRead: (id) =>
    set((s) => ({
      items: s.items.map((it) => (it.id === id ? { ...it, read: true } : it)),
    })),
  markAllRead: () =>
    set((s) => ({ items: s.items.map((it) => ({ ...it, read: true })) })),
  remove: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
  unreadCount: () => get().items.filter((it) => !it.read).length,
}));

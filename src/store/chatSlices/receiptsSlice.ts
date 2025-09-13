import type { RootState } from "../chatStore";

export type ReceiptsSlice = {
  lastReadAtByRoom: Record<string, number>;
  unreadCountByRoom: Record<string, number>;
  unreadOthersByMessageId: Record<string, number>;

  setRoomUnread: (roomId: string, count: number) => void;
  setLastReadAt: (roomId: string, ts: number) => void;
  markRead: (roomId: string, upTo: number) => void;

  applyMessageReceipts: (msgId: string, unreadOthers: number) => void;
  applyMessageReceiptsBulk: (
    items: Array<{ msgId: string; unreadOthers: number }>
  ) => void;
};

export const createReceiptsSlice = (set: any, get: any): ReceiptsSlice => ({
  lastReadAtByRoom: {},
  unreadCountByRoom: {},
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

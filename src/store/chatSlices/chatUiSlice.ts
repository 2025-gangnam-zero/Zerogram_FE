import type { RootState } from "../chatStore";

export type ChatUiSlice = {
  draftByRoomId: Record<string, string>;
  isDndDragging: boolean;
  setDraft: (roomId: string, text: string) => void;
  clearDraft: (roomId: string) => void;
  setDndDragging: (on: boolean) => void;
};

export const createChatUiSlice = (set: any, get: any): ChatUiSlice => ({
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

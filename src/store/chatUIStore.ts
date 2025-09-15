import { create as createU } from "zustand";
// (옵션) ChatAttachment 타입이 있다면 주석 해제
// import type { ChatAttachment } from "../types";

type TypingByRoom = Record<string, Record<string, boolean>>;

export type ChatUIState = {
  // 드래그 앤 드롭 오버레이
  dndOver: boolean;
  setDndOver: (v: boolean) => void;

  // 이미지 라이트박스
  lightboxOpen: boolean;
  lightboxImages: string[]; // 확대 보기 대상 이미지 URL들
  lightboxIndex: number;
  openLightbox: (images: string[], index: number) => void;
  closeLightbox: () => void;

  // 업로드 미리보기 모달(드롭/선택 결과)
  modalOpen: boolean;
  modalItems: { id: string; previewUrl: string; name: string; size: number }[];
  openModal: (items: ChatUIState["modalItems"]) => void;
  closeModal: () => void;

  typingByRoom: TypingByRoom;
  setTyping: (roomId: string, userId: string, on: boolean) => void;
  getTypingUsers: (roomId: string, excludeUserId?: string) => string[];
  clearRoomTyping: (roomId: string) => void;

  // (옵션) 첨부에서 바로 라이트박스 열기
  // openLightboxFromAttachments?: (atts: ChatAttachment[], startUrl?: string) => void;
};

const uniq = (arr: string[]) => Array.from(new Set(arr));

export const useChatUIStore = createU<ChatUIState>((set, get) => ({
  dndOver: false,
  setDndOver: (v) => set({ dndOver: v }),

  lightboxOpen: false,
  lightboxImages: [],
  lightboxIndex: 0,
  openLightbox: (images, index) => {
    const deduped = uniq(images.filter(Boolean));
    const idx = Math.min(
      Math.max(index ?? 0, 0),
      Math.max(deduped.length - 1, 0)
    );
    set({ lightboxOpen: true, lightboxImages: deduped, lightboxIndex: idx });
  },
  closeLightbox: () =>
    set({ lightboxOpen: false, lightboxImages: [], lightboxIndex: 0 }),

  modalOpen: false,
  modalItems: [],
  openModal: (items) => set({ modalOpen: true, modalItems: items ?? [] }),
  closeModal: () => set({ modalOpen: false, modalItems: [] }),

  typingByRoom: {},

  setTyping: (roomId, userId, on) =>
    set((state) => {
      const room = state.typingByRoom[roomId] ?? {};
      if (room[userId] === on) return state; // 변화 없으면 skip
      return {
        typingByRoom: {
          ...state.typingByRoom,
          [roomId]: { ...room, [userId]: on },
        },
      };
    }),

  getTypingUsers: (roomId, excludeUserId) => {
    const m = get().typingByRoom[roomId] || {};
    return Object.keys(m).filter((uid) => m[uid] && uid !== excludeUserId);
  },

  clearRoomTyping: (roomId) =>
    set((state) => {
      if (!state.typingByRoom[roomId]) return state;
      const next = { ...state.typingByRoom };
      delete next[roomId];
      return { typingByRoom: next };
    }),

  // (옵션) 첨부에서 라이트박스 열기: ChatAttachment 사용 시 주석 해제
  // openLightboxFromAttachments: (atts, startUrl) => {
  //   const images = atts
  //     .filter((a) => a.kind === "image")
  //     .map((a) => a.url)
  //     .filter(Boolean);
  //   const idx = startUrl ? Math.max(0, images.indexOf(startUrl)) : 0;
  //   get().openLightbox(images, idx);
  // },
}));

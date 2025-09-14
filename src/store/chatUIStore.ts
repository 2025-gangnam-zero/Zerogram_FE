import { create as createU } from "zustand";

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
};

export const useChatUIStore = createU<ChatUIState>((set) => ({
  dndOver: false,
  setDndOver: (v) => set({ dndOver: v }),

  lightboxOpen: false,
  lightboxImages: [],
  lightboxIndex: 0,
  openLightbox: (images, index) =>
    set({ lightboxOpen: true, lightboxImages: images, lightboxIndex: index }),
  closeLightbox: () =>
    set({ lightboxOpen: false, lightboxImages: [], lightboxIndex: 0 }),

  modalOpen: false,
  modalItems: [],
  openModal: (items) => set({ modalOpen: true, modalItems: items }),
  closeModal: () => set({ modalOpen: false, modalItems: [] }),
}));

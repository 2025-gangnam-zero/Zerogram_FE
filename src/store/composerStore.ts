import { create } from "zustand";
import type { UploadAttachment } from "../types"; // ✅ 변경: ../types/chat -> ../types
import { processImages } from "../utils";

const MAX_IMAGES = 4;
const MAX_EACH_MB = 10;

type RoomComposer = {
  text: string;
  pendingSend: boolean; // IME Enter 중 전송 대기
  attachments: UploadAttachment[]; // ✅ 변경: Attachment -> UploadAttachment
};

type ComposerState = {
  byRoom: Record<string, RoomComposer>;
  // selectors/setters
  ensureRoom: (roomId: string) => void;
  setText: (roomId: string, text: string) => void;
  setPendingSend: (roomId: string, v: boolean) => void;
  clear: (roomId: string) => void;

  // files ingest
  addFiles: (roomId: string, files: File[]) => Promise<void>;
  removeAttachment: (roomId: string, attId: string) => void;
  reorderAttachments: (roomId: string, from: number, to: number) => void;
};

export const useComposerStore = create<ComposerState>((set, get) => ({
  byRoom: {},

  ensureRoom: (roomId) =>
    set((s) => {
      if (s.byRoom[roomId]) return s;
      return {
        byRoom: {
          ...s.byRoom,
          [roomId]: { text: "", pendingSend: false, attachments: [] },
        },
      };
    }),

  setText: (roomId, text) =>
    set((s) => ({
      byRoom: {
        ...s.byRoom,
        [roomId]: {
          ...(s.byRoom[roomId] ?? {
            text: "",
            pendingSend: false,
            attachments: [],
          }),
          text,
        },
      },
    })),

  setPendingSend: (roomId, v) =>
    set((s) => ({
      byRoom: {
        ...s.byRoom,
        [roomId]: {
          ...(s.byRoom[roomId] ?? {
            text: "",
            pendingSend: false,
            attachments: [],
          }),
          pendingSend: v,
        },
      },
    })),

  clear: (roomId) =>
    set((s) => ({
      byRoom: {
        ...s.byRoom,
        [roomId]: { text: "", pendingSend: false, attachments: [] },
      },
    })),

  addFiles: async (roomId, files) => {
    const s = get();
    const room = s.byRoom[roomId] ?? {
      text: "",
      pendingSend: false,
      attachments: [],
    };
    // 1) 이미지만 허용
    const onlyImages = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    // 2) 개별 10MB 제한
    const underLimit = onlyImages.filter(
      (f) => f.size <= MAX_EACH_MB * 1024 * 1024
    );
    if (underLimit.length < onlyImages.length) {
      alert(`개별 파일 최대 ${MAX_EACH_MB}MB를 초과한 파일은 제외됩니다.`);
    }
    // 3) 개수 제한(현재 첨부 포함 4장)
    const remain = Math.max(0, MAX_IMAGES - room.attachments.length);
    const cropped = underLimit.slice(0, remain);
    if (cropped.length < underLimit.length) {
      alert(`이미지는 최대 ${MAX_IMAGES}장만 첨부할 수 있습니다.`);
    }
    if (cropped.length === 0) return;

    // 4) 압축/전처리
    const processed = await processImages(cropped, {
      maxEdge: 2048,
      quality: 0.85,
    });
    const toAdd: UploadAttachment[] = processed.map((p) => ({
      id: Math.random().toString(36).slice(2),
      file: p.file,
      mime: p.file.type,
      size: p.file.size,
      previewUrl: p.previewUrl,
      width: p.width,
      height: p.height,
      processed: true,
    }));

    set((s2) => ({
      byRoom: {
        ...s2.byRoom,
        [roomId]: {
          ...(s2.byRoom[roomId] ?? room),
          attachments: [...room.attachments, ...toAdd],
        },
      },
    }));
  },

  removeAttachment: (roomId, attId) =>
    set((s) => ({
      byRoom: {
        ...s.byRoom,
        [roomId]: {
          ...(s.byRoom[roomId] ?? {
            text: "",
            pendingSend: false,
            attachments: [],
          }),
          attachments: (s.byRoom[roomId]?.attachments ?? []).filter(
            (a) => a.id !== attId
          ),
        },
      },
    })),

  reorderAttachments: (roomId, from, to) =>
    set((s) => {
      const list = [...(s.byRoom[roomId]?.attachments ?? [])];
      if (
        list.length === 0 ||
        from < 0 ||
        to < 0 ||
        from >= list.length ||
        to >= list.length
      ) {
        return { byRoom: s.byRoom };
      }
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      return {
        byRoom: {
          ...s.byRoom,
          [roomId]: {
            ...(s.byRoom[roomId] ?? {
              text: "",
              pendingSend: false,
              attachments: [],
            }),
            attachments: list,
          },
        },
      };
    }),
}));

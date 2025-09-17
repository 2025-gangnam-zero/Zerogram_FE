import {
  ChatroomListItem,
  SendMessageAck,
  ServerRoom,
  UploadAttachment,
} from "../types";
import { getSocket } from "./socket";

export const extractFirstUrl = (text?: string) => {
  if (!text) return null;
  const m = text.match(/(https?:\/\/[^\s<>"']+)|(www\.[^\s<>"']+)/i);
  if (!m) return null;
  const raw = m[0].startsWith("http") ? m[0] : `https://${m[0]}`;
  try {
    return new URL(raw).toString();
  } catch {
    return null;
  }
};

export const isImageUrl = (url: string) => {
  return /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(url);
};

type Options = { maxEdge: number; quality: number };

const loadBitmap = async (
  file: File
): Promise<ImageBitmap | HTMLImageElement> => {
  try {
    return await createImageBitmap(file);
  } catch {
    // fallback
    const img = new Image();
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.src = URL.createObjectURL(file);
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("image-decode-failed"));
    });
    return img;
  }
};

const toCanvas = (source: ImageBitmap | HTMLImageElement, maxEdge: number) => {
  const sw = "width" in source ? source.width : (source as any).naturalWidth;
  const sh = "height" in source ? source.height : (source as any).naturalHeight;
  const ratio = Math.min(1, maxEdge / Math.max(sw, sh));
  const dw = Math.max(1, Math.round(sw * ratio));
  const dh = Math.max(1, Math.round(sh * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = dw;
  canvas.height = dh;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(source as any, 0, 0, dw, dh);
  return { canvas, dw, dh };
};

export const processImages = async (files: File[], opt: Options) => {
  const out: {
    file: File;
    previewUrl: string;
    width: number;
    height: number;
  }[] = [];

  for (const f of files) {
    // heic/heif는 브라우저 미지원 → 그대로 두면 미리보기 불가. 서버 변환 권장.
    if (/image\/(heic|heif)/i.test(f.type)) {
      alert("HEIC/HEIF 이미지는 브라우저에서 미리보기가 어려워 제외됩니다.");
      continue;
    }

    // PNG/WEBP는 원본 유지(리사이즈만), JPEG 계열은 품질 압축 권장
    const isPng = /image\/png/i.test(f.type);
    const isWebp = /image\/webp/i.test(f.type);
    const isJpegLike = /image\/jpe?g/i.test(f.type);

    const src = await loadBitmap(f);
    const { canvas, dw, dh } = toCanvas(src, opt.maxEdge);

    const exportMime = isPng || isWebp ? f.type : "image/jpeg";
    const quality = isJpegLike ? opt.quality : 0.92; // PNG/WEBP는 quality 무시됨

    const blob: Blob = await new Promise((res) =>
      canvas.toBlob((b) => res(b!), exportMime, quality)
    );
    const file = new File([blob], f.name.replace(/\.(heic|heif)$/i, ".jpg"), {
      type: exportMime,
    });

    out.push({
      file,
      previewUrl: URL.createObjectURL(file),
      width: dw,
      height: dh,
    });
  }
  return out;
};

export const sendMessage = (opts: {
  roomId: string;
  type: "image" | "text";
  content?: string;
  attachments?: UploadAttachment[];
  clientMessageId: string;
}) => {
  return new Promise<SendMessageAck>((resolve) => {
    const sock = getSocket();
    sock.emit("message:send", opts, (ack: { ok: boolean; id?: string }) => {
      resolve(ack);
    });
  });
};

export const setTyping = (roomId: string, on: boolean) => {
  const sock = getSocket();
  sock.emit("typing", { roomId, on });
};

export function pickDefined<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return (Object.keys(obj) as Array<keyof T>).reduce((acc, key) => {
    const v = obj[key];
    if (v === undefined || v === null) return acc;
    if (typeof v === "string" && v.trim() === "") return acc;
    acc[key] = v as T[typeof key];
    return acc;
  }, {} as Partial<T>);
}

// 서버 -> 전역 스토어 매핑
export const toClientRoom = (r: ServerRoom): ChatroomListItem => ({
  id: r.id,
  roomName: r.roomName,
  roomImageUrl: r.roomImageUrl ?? undefined,
  roomDescription: r.roomDescription ?? undefined,
  workoutType: r.workoutType ?? undefined,
  memberCount: r.memberCount ?? 1,
  memberCapacity: r.memberCapacity ?? undefined,
  lastMessage: r.lastMessage ?? undefined,
  lastMessageAt: r.lastMessageAt ?? undefined,
  unreadCount: r.unreadCount ?? 0,
  createdAt: r.createdAt,
  isPinned: undefined,
});

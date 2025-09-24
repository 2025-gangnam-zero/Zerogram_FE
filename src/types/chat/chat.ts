export type PreviewItem = {
  id: string;
  url: string;
  name: string;
  kind: "image" | "video" | "other";
  file: File;
};

export type ChatUser = {
  userId: string;
  nickname: string;
  profile_image?: string;
};

export type Attachment = {
  fileUrl: string;
  fileName?: string;
  contentType?: string;
  size?: number;
  width?: number;
  height?: number;
};

export type ChatMessageDTO = {
  id: string;
  serverId: string;
  roomId: string;
  authorId: string;
  author: ChatUser;
  text?: string;
  attachments?: Attachment[];
  seq: number;
  createdAtIso: string; // ISO 문자열
  meta?: { readCount?: number };
};

export type ChatMessage = {
  id: string; // messageId
  serverId: string;
  roomId: string;
  authorId: string;
  author: ChatUser;
  text?: string;
  attachments?: Attachment[];
  seq: number;
  createdAt: string; // = createdAtIso 매핑
  meta?: { readCount?: number };
};

// ✅ 단일 이벤트용
export type IncomingAttachment = {
  fileName: string;
  contentType?: string;
  size?: number;
  width?: number; // 서버에서 메타를 추출하지 않으므로 입력값 그대로 저장(선택)
  height?: number; // "
  data: ArrayBuffer; // 클라 → 서버 바이너리
};

export type SendPayload = {
  roomId: string;
  text?: string; // 텍스트만/파일만/둘 다 허용
  attachments?: IncomingAttachment[]; // 없으면 텍스트-only
  serverId?: string; // (옵션) 클라 생성 시 전달, 아니면 서버가 생성
};

export type SendAck = {
  ok: boolean;
  id?: string; // ← messageId (_id)
  serverId?: string; // ← 멱등키
  createdAt?: string; // ← ISO (필드명 createdAt로 통일)
  seq?: number; // 포함 (예)
  attachments?: Attachment[];
  error?: string;
};

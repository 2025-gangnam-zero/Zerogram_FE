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

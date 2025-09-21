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
  id: string; // = serverId 매핑
  roomId: string;
  authorId: string;
  author: ChatUser;
  text?: string;
  attachments?: Attachment[];
  seq: number;
  createdAt: string; // = createdAtIso 매핑
  meta?: { readCount?: number };
};

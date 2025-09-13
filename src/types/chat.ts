export type Sender = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type RoomMember = {
  user: Pick<Sender, "id" | "name" | "avatarUrl">;
  joinedAt: number; // epoch ms
  leftAt?: number | null; // null이면 아직 활동 중
  lastReadAt?: number | null;
  isBot?: boolean;
};

export type Room = {
  id: string;
  roomName: string;
  roomImageUrl: string;
  memberCount: number; // 리스트/헤더용 캐시 숫자
  members?: RoomMember[]; // 상세/읽음 계산용 (지연 로딩 가능)
};

export type Message = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string;
  content: string;
  createdAt: number;
};

export type LastMessage = {
  id: string;
  author: Pick<Sender, "id" | "name">;
  type: "text" | "image" | "video" | "file" | "audio" | "sticker" | "system";
  text?: string;
  attachments?: Array<{
    kind: "image" | "video" | "file" | "audio" | "sticker";
    name?: string;
    mime?: string;
    size?: number;
    thumbUrl?: string;
  }>;
  createdAt: number;
  deleted?: boolean;
  pinned?: boolean;
};

export type CHThread = {
  id: string;
  room: Room;
  lastMessage?: LastMessage;
  unreadCount: number;
};

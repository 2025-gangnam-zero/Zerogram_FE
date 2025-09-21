export type SidebarListItemData = {
  id: string; // roomId
  roomName: string;
  imageUrl?: string;
  memberCount?: number;
  lastMessage?: string;
  lastMessageAt?: string; // ISO (서버에서 toISOString())
  unreadCount?: number;
};

export type RoomNotice = {
  text?: string;
  enabled?: boolean;
  authorId?: string;
  updatedAt?: string; // ISO (서버 직렬화)
};

// 방 상세/헤더에서 사용할 수 있는 DTO
export type RoomDTO = {
  id: string;
  meetId: string;
  roomName: string;
  imageUrl?: string;
  description?: string;
  memberCapacity?: number;
  lastMessage?: string;
  lastMessageAt?: string; // ISO
  seqCounter: number;
  notice?: RoomNotice;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

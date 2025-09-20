export type SidebarListItemData = {
  id: string;
  roomName: string;
  imageUrl?: string;
  memberCount?: number;
  lastMessage?: string; // mine 전용
  lastMessageAt?: string; // mine 전용 (ISO or 포맷 문자열)
  unreadCount?: number; // mine 전용
};

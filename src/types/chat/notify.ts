export type NotifyUpdate = {
  roomId: string;
  roomName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unread: number;
};

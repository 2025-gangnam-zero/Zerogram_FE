export type ChatUser = {
  id: string;
  name?: string;
  avatarUrl?: string;
};

export type ChatMessage = {
  id: string;
  text: string;
  createdAt: string | Date;
  author: ChatUser;
  meta?: {
    readCount?: number; // 내 메시지일 때 읽음 수 등
  };
};

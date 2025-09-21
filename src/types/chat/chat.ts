export type ChatUser = {
  userId: string;
  nickname: string;
  profile_image?: string;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  text: string;
  createdAt: string;
  author: ChatUser;
  meta?: {
    readCount?: number; // 내 메시지일 때 읽음 수 등
  };
};

export type Attchement = {};

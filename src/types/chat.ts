import { WorkoutType } from "./workout";

export type ChatroomListItem = {
  id: string;
  roomName: string;
  roomImageUrl: string;
  memberCount: number;
  lastMessage: string | null;
  lastMessageAt: string; // "오전 12:15" 같은 포맷 텍스트 그대로 받는다고 가정
  unreadCount: number;
  isPinned?: boolean; // 고정 여부(핀)
  workoutType: WorkoutType;
  memberCapacity: number; // 최대 정원
  roomDescription: string; // 방 설명
};

export type ChatMessage = {
  id: string;
  roomId: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  content?: string; // 텍스트 메시지
  images?: string[]; // 이미지 URL 배열
  createdAt: string; // 표시용 시간
  isMine?: boolean; // 본인 여부
  unreadByCount?: number; // 아직 이 메시지를 읽지 않은 멤버 수
};

export type MessagesByRoom = {
  [roomId: string]: ChatMessage[];
};

export type Attachment = {
  id: string;
  file: File;
  mime: string;
  size: number;
  previewUrl: string; // ObjectURL
  width?: number;
  height?: number;
  processed?: boolean; // 압축/전처리 완료 플래그
};

export type DroppedItem = {
  id: string;
  file: File;
  isImage: boolean;
  previewUrl?: string; // 이미지면 ObjectURL
  selected: boolean;
};

export interface RoomsListResponseDTO {
  items: ChatroomListItem[];
  nextCursor?: string | null;
}

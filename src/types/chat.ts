import { WorkoutType } from "./workout";

/** 방 리스트 아이템 */
export type ChatroomListItem = {
  id: string; // Room._id
  roomName: string;
  roomImageUrl?: string | null;
  roomDescription?: string | null;

  workoutType?: WorkoutType;

  memberCount: number;
  memberCapacity?: number;

  lastMessage?: string | null;
  lastMessageAt?: string | null; // ISO string (표시 시 포맷팅)

  unreadCount: number;

  /** RoomMembership 기반 사용자 개별 설정 */
  isPinned?: boolean;
};

/** 서버 Attachment 매핑 */
export type ChatAttachment = {
  kind: "image" | "file";
  url: string;
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  originalName?: string | null;
  thumbUrl?: string | null;
};

/** 메시지 아이템 */
export type ChatMessage = {
  id: string; // Message._id
  roomId: string;
  seq: number;

  author: {
    id: string;
    name: string;
    avatarUrl: string;
  };

  type: "text" | "image" | "file" | "system.notice";
  content?: string | null;
  attachments?: ChatAttachment[]; // 이미지/파일 메시지

  createdAt: string; // ISO string
  editedAt?: string | null;
  deletedAt?: string | null;

  isMine?: boolean; // 클라 편의 플래그
  unreadByCount?: number; // 아직 이 메시지를 읽지 않은 멤버 수

  /** 클라 전송 상태 관리 */
  pending?: boolean;
  failed?: boolean;
};

/** 방별 메시지 맵 */
export type MessagesByRoom = {
  [roomId: string]: ChatMessage[];
};

/** 클라이언트 업로드 전용 Attachment */
export type UploadAttachment = {
  id: string;
  file: File;
  mime: string;
  size: number;
  previewUrl: string; // ObjectURL
  width?: number;
  height?: number;
  processed?: boolean;
};

/** 드래그&드롭 항목 */
export type DroppedItem = {
  id: string;
  file: File;
  isImage: boolean;
  previewUrl?: string;
  selected: boolean;
};

/** 방 리스트 API 응답 */
export interface RoomsListResponseDTO {
  items: ChatroomListItem[];
  nextCursor?: string | null;
}

export type ChatNotificationItem = {
  id: string; // 서버 _id
  userId: string;
  roomId: string;
  lastMessageId: string;
  lastPreview?: string | null;
  count: number; // 누적 미확인 개수
  status: "queued" | "delivered" | "read" | "cleared";
  mutedAt?: string | null; // ISO (선택)
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type SendMessageAck = {
  ok: boolean;
  serverId?: string;

  // ✅ 서버가 내려줄 수 있는(선택) 메타들
  seq?: number;
  createdAt?: string;
  attachments?: ChatAttachment[];

  error?: string;
};

import { WorkoutType } from "./workout";

/** 방 리스트 아이템 */
export type ChatroomListItem = {
  id: string; // Room._id
  roomName: string;
  roomImageUrl?: string | null;
  roomDescription?: string | null;

  workoutType?: WorkoutType;

  memberCount?: number;
  memberCapacity?: number;

  lastMessage?: string | null;
  lastMessageAt?: string | null; // ISO string (표시 시 포맷팅)

  unreadCount?: number;

  createdAt?: string;
  /** RoomMembership 기반 사용자 개별 설정 */
  isPinned?: boolean;

  seqCounter?: number;
  lastReadSeq?: number;
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
export type MessageDto = {
  id: string;
  clientMessageId?: string;
  roomId: string;
  seq: number;
  author: { id: string; name: string; avatarUrl?: string };
  type: "text" | "system.notice" | "image" | "file";
  content?: string | null;
  attachments?: ChatAttachment[] | null;
  createdAt: string;
  editedAt?: string | null;
  deletedAt?: string | null;
};

// UI에서만 쓰는 부가 필드들은 전부 optional
export type ChatMessage = MessageDto & {
  isMine?: boolean;
  unreadByCount?: number;
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
  nextCursor?: CursorPayload | null;
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
  id?: string;

  // ✅ 서버가 내려줄 수 있는(선택) 메타들
  seq?: number;
  clientMessageId?: number;
  createdAt?: string;
  attachments?: ChatAttachment[];

  error?: string;
};

export type CursorPayload = { lastMessageAt: string | null; id: string };

export type ListRoomsRequestDto = {
  q?: string;
  workoutType?: WorkoutType;
  cursor?: CursorPayload; // 둘 다 있어야 세팅
  limit?: number; // 기본 50
};

export type RoomListItemDto = {
  id: string;
  roomName: string;
  roomImageUrl?: string | null;
  roomDescription?: string | null;
  workoutType?: "running" | "fitness";
  memberCount?: number;
  memberCapacity?: number;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number; // 퍼블릭 목록에서는 보통 없음(서버가 0 주거나 누락)
  createdAt?: string;
};

export type ListRoomsResponseDto = {
  items: RoomListItemDto[];
  nextCursor?: CursorPayload | null;
};

export type CreateRoomRequestDto = {
  roomName: string;
  roomImageUrl?: string;
  workoutType?: WorkoutType;
};

export type CreateRoomResponseDto = {
  room: RoomListItemDto;
};

export type DeleteRoomResponseDto = {
  roomId: string;
};

// 서버 응답 래퍼
export type ApiEnvelope<TData> = {
  success: boolean;
  message: string;
  code: string;
  timestamp: string;
  data: TData;
};

// 프로젝트 공용 타입과 최대한 호환되게(서버 응답 필드 superset)
export type ServerRoom = {
  id: string;
  roomName: string;
  roomImageUrl?: string | null;
  roomDescription?: string | null;
  workoutType?: "running" | "fitness";
  memberCount?: number;
  memberCapacity?: number;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
  createdAt?: string;
};

// 퍼블릭 방 목록 조회 요청/응답 DTO (필요시 프로젝트 타입에 맞게 조정)
export type PublicRoomsRequestDto = {
  q?: string;
  workoutType?: "running" | "fitness";
  limit?: number; // 기본 50
  cursor?: { id?: string; lastMessageAt?: string | null };
};

export type PublicRoomsResponseDto = {
  items: RoomListItemDto[];
  nextCursor?: { id: string; lastMessageAt: string | null } | null;
};

export type PublicRoomListItemDto = {
  id: string;
  roomName: string;
  roomImageUrl?: string | null;
  roomDescription?: string | null;
  workoutType?: "running" | "fitness";
  memberCapacity?: number;
  memberCount?: number;

  lastMessage?: string | null;
  lastMessageAt?: string | null;
  createdAt?: string;
};

export type GlobalRoomSummaryEvent = {
  id: string; // roomId
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  memberCount?: number;
  seqCounter: number; // unread = seqCounter - lastReadSeq
};

export type ReadUpdatedEvent = {
  roomId: string;
  userId: string;
  lastReadSeq: number;
  lastReadAt: string; // ISO
};

export type RoomUpdatedEvent = {
  roomId: string;
  patch: { notice?: string | null; memberCount?: number };
  updatedAt: string; // ISO
};

export type RoomJoinAck =
  | { ok: true; roomId: string; sinceSeq: number }
  | {
      ok: false;
      code: "ROOM_NOT_MEMBER" | "FORBIDDEN" | "ROOM_NOT_FOUND" | "UNKNOWN";
    };

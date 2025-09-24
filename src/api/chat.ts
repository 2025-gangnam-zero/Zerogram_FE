import { ApiResponse, ChatMessage, ChatMessageDTO, RoomNotice } from "../types";
import { getApiErrorMessage, logError, toChatMessage } from "../utils";
import authApi from "./auth";

// 내 방 목록
export const getMyRoomsApi = async (params?: {
  limit?: number; // 1~100
  cursor?: string | null; // 서버에서 받은 nextCursor
  q?: string; // 검색어
}): Promise<ApiResponse<{ items: any[]; nextCursor?: string | null }>> => {
  try {
    const res = await authApi.get("/rooms/mine", { params });
    return res.data;
  } catch (error) {
    logError("getMyRoomsApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 방 상세
export const getRoomApi = async (
  roomId: string
): Promise<ApiResponse<{ room: any }>> => {
  try {
    const res = await authApi.get(`/rooms/${roomId}`);
    return res.data;
  } catch (error) {
    logError("getRoomApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// ===== Notice =====

// 공지 조회
export const getRoomNoticeApi = async (
  roomId: string
): Promise<ApiResponse<{ notice: RoomNotice | null }>> => {
  try {
    const res = await authApi.get(`/rooms/${roomId}/notice`);
    return res.data;
  } catch (error) {
    logError("getRoomNoticeApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 공지 수정 (owner/admin)
export const updateRoomNoticeApi = async (
  roomId: string,
  payload: { text?: string; enabled?: boolean }
): Promise<ApiResponse<{ ok: boolean }>> => {
  try {
    const res = await authApi.put(`/rooms/${roomId}/notice`, payload);
    return res.data;
  } catch (error) {
    logError("updateRoomNoticeApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 공지 삭제 (owner/admin)
export const deleteRoomNoticeApi = async (
  roomId: string
): Promise<ApiResponse<{ notice: RoomNotice | null }>> => {
  try {
    const res = await authApi.delete(`/rooms/${roomId}/notice`);
    return res.data;
  } catch (error) {
    logError("deleteRoomNoticeApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// ===== Membership / Read =====

// 멤버 목록
export const listRoomMembersApi = async (
  roomId: string,
  params?: { limit?: number; cursor?: string | null }
): Promise<ApiResponse<{ items: any[]; nextCursor?: string | null }>> => {
  try {
    const res = await authApi.get(`/rooms/${roomId}/members`, { params });
    return res.data;
  } catch (error) {
    logError("listRoomMembersApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 방 나가기
export const leaveRoomApi = async (
  roomId: string
): Promise<ApiResponse<{ ok: boolean }>> => {
  try {
    const res = await authApi.post(`/rooms/${roomId}/leave`);
    return res.data;
  } catch (error) {
    logError("leaveRoomApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 읽음 커밋
export const commitReadApi = async (
  roomId: string,
  payload: { lastReadMessageId?: string; lastReadSeq?: number }
): Promise<ApiResponse<{ lastReadSeq: number }>> => {
  try {
    const res = await authApi.post(`/rooms/${roomId}/read`, payload);
    return res.data;
  } catch (error) {
    logError("commitReadApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 미읽음 수
export const getUnreadCountApi = async (
  roomId: string
): Promise<ApiResponse<{ unreadCount: number }>> => {
  try {
    const res = await authApi.get(`/rooms/${roomId}/unread-count`);
    return res.data;
  } catch (error) {
    logError("getUnreadCountApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// ===== Messages =====

// 메시지 목록(무한스크롤: beforeId/beforeSeq/limit)
export const getMessagesApi = async (
  roomId: string,
  params?: { beforeId?: string; beforeSeq?: number; limit?: number }
): Promise<ApiResponse<{ items: ChatMessage[] }>> => {
  try {
    const res = await authApi.get(`/rooms/${roomId}/messages`, { params });

    // 서버: { items: ChatMessageDTO[] }
    const dtoItems: ChatMessageDTO[] =
      res.data?.data?.items ?? res.data?.items ?? [];
    const items = dtoItems.map(toChatMessage);

    // 기존 공통 응답 포맷에 맞춰 재구성 (data 안에 items)
    return {
      ...(res.data ?? {}),
      data: { items },
    };
  } catch (error) {
    logError("getMessagesApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 메시지 삭제 (작성자 or owner/admin)
export const deleteMessageApi = async (
  roomId: string,
  messageId: string
): Promise<ApiResponse<{ ok: boolean }>> => {
  try {
    const res = await authApi.delete(`/rooms/${roomId}/messages/${messageId}`);
    return res.data;
  } catch (error) {
    logError("deleteMessageApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

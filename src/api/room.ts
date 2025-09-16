import type {
  ApiEnvelope,
  ListRoomsRequestDto,
  ListRoomsResponseDto,
  CreateRoomRequestDto,
  CreateRoomResponseDto,
  DeleteRoomResponseDto,
  PublicRoomsRequestDto,
  PublicRoomsResponseDto,
  RoomListItemDto,
} from "../types";
import { getApiErrorMessage } from "../utils";
import authApi from "./auth";

// 공개방 목록
export async function listPublicRoomsApi(
  params: PublicRoomsRequestDto = {}
): Promise<PublicRoomsResponseDto> {
  try {
    const res = await authApi.get<{ data: PublicRoomsResponseDto }>(
      "/rooms/public",
      {
        params: {
          q: params.q,
          workoutType: params.workoutType,
          limit: params.limit ?? 50,
          cursorId: params.cursor?.id,
          cursorLastMessageAt:
            params.cursor?.lastMessageAt === null
              ? "null"
              : params.cursor?.lastMessageAt,
        },
      }
    );
    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

// 내가 속한 모든 방 + 검색/커서
export async function listMyJoinedRoomsApi(params: ListRoomsRequestDto = {}) {
  try {
    const res = await authApi.get<ApiEnvelope<ListRoomsResponseDto>>("/rooms", {
      params: {
        q: params.q,
        workoutType: params.workoutType,
        limit: params.limit ?? 50,
        // 서버 컨트롤러 파싱 규칙에 맞추기
        cursorId: params.cursor?.id,
        cursorLastMessageAt:
          params.cursor?.lastMessageAt === null
            ? "null"
            : params.cursor?.lastMessageAt, // undefined면 미전달
      },
    });
    return res.data.data; // { items, nextCursor }
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

// 방 생성
export async function createRoomApi(body: CreateRoomRequestDto) {
  try {
    const res = await authApi.post<ApiEnvelope<CreateRoomResponseDto>>(
      "/rooms",
      body
    );
    return res.data.data.room; // RoomListItemDto
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

// 방 삭제
export async function deleteRoomApi(roomId: string) {
  try {
    const res = await authApi.delete<ApiEnvelope<DeleteRoomResponseDto>>(
      `/rooms/${roomId}`
    );
    return res.data.data.roomId; // string
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

// 방 가입
export async function joinRoomApi(roomId: string): Promise<RoomListItemDto> {
  try {
    const res = await authApi.post<ApiEnvelope<{ room: RoomListItemDto }>>(
      `/rooms/${roomId}/join`
    );
    return res.data.data.room;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

// 방 탈퇴
export async function leaveRoomApi(
  roomId: string
): Promise<{ roomId: string }> {
  try {
    const res = await authApi.post<ApiEnvelope<{ roomId: string }>>(
      `/rooms/${roomId}/leave`
    );
    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

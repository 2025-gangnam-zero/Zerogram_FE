import type {
  ApiEnvelope,
  ListRoomsRequestDto,
  ListRoomsResponseDto,
  CreateRoomRequestDto,
  CreateRoomResponseDto,
  DeleteRoomResponseDto,
} from "../types";
import { getApiErrorMessage } from "../utils";
import authApi from "./auth";

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

import { ApiResponse, RoomsListResponseDTO, WorkoutType } from "../types";
import { getApiErrorMessage, logError } from "../utils";
import authApi from "./auth";

export interface FetchRoomsParams {
  limit: number;
  q?: string;
  workoutType?: WorkoutType;
  cursor?: string;
}

export const getRoomsApi = async (
  params: FetchRoomsParams
): Promise<ApiResponse<RoomsListResponseDTO>> => {
  try {
    const { data } = await authApi.get<ApiResponse<RoomsListResponseDTO>>(
      "/rooms",
      {
        params,
      }
    );

    return data;
  } catch (error) {
    logError("fetchRoomsApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

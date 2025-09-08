import authApi from "./auth";
import { getApiErrorMessage, logError } from "../utils";
import { ApiResponse, workouts } from "../types";

// 운동일지 생성
export const createWorkoutApi = async (
  workoutData: Omit<workouts, "_id" | "createdAt" | "updatedAt">
): Promise<ApiResponse<workouts>> => {
  try {
    const response = await authApi.post("/workouts", workoutData);
    return response.data;
  } catch (error) {
    logError("createWorkoutApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 특정 날짜의 운동일지 조회
export const getWorkoutsByDateApi = async (
  date: string
): Promise<ApiResponse<workouts[]>> => {
  try {
    const response = await authApi.get(`/workouts/date/${date}`);
    return response.data;
  } catch (error) {
    logError("getWorkoutsByDateApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 사용자의 모든 운동일지 조회
export const getUserWorkoutsApi = async (): Promise<
  ApiResponse<workouts[]>
> => {
  try {
    const response = await authApi.get("/workouts");
    return response.data;
  } catch (error) {
    logError("getUserWorkoutsApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 운동일지 수정
export const updateWorkoutApi = async (
  workoutId: string,
  workoutData: Partial<workouts>
): Promise<ApiResponse<workouts>> => {
  try {
    const response = await authApi.patch(`/workouts/${workoutId}`, workoutData);
    return response.data;
  } catch (error) {
    logError("updateWorkoutApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 운동일지 삭제
export const deleteWorkoutApi = async (
  workoutId: string
): Promise<ApiResponse> => {
  try {
    const response = await authApi.delete(`/workouts/${workoutId}`);
    return response.data;
  } catch (error) {
    logError("deleteWorkoutApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

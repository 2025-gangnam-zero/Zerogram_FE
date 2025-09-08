import authApi from "./auth";
import { getApiErrorMessage, logError } from "../utils";
import {
  ApiResponse,
  WorkoutState,
  CreateWorkoutRequest,
  WorkoutDetailType,
} from "../types";

// 운동일지 생성
export const createWorkoutApi = async (
  workoutData: CreateWorkoutRequest
): Promise<ApiResponse<WorkoutState>> => {
  try {
    const response = await authApi.post("/users/me/workouts", workoutData);
    return response.data;
  } catch (error) {
    logError("createWorkoutApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 사용자의 모든 운동일지 조회
export const getUserWorkoutsApi = async (): Promise<
  ApiResponse<WorkoutState[]>
> => {
  try {
    const response = await authApi.get("/users/me/workouts");
    console.log("백엔드 응답 데이터:", response.data); // 디버깅용
    return response.data;
  } catch (error) {
    logError("getUserWorkoutsApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 특정 날짜의 운동일지 조회
export const getWorkoutsByDateApi = async (
  date: string
): Promise<ApiResponse<WorkoutState[]>> => {
  try {
    console.log("요청된 날짜:", date); // 디버깅용

    const response = await getUserWorkoutsApi();

    // 응답 데이터가 배열인지 확인
    let workoutsArray: WorkoutState[] = [];

    if (Array.isArray(response.data)) {
      workoutsArray = response.data;
    } else if (response.data && typeof response.data === "object") {
      // 백엔드 응답 구조에 맞게 수정
      const dataObj = response.data as any;

      // response.data.data.workouts 구조 확인
      if (dataObj.data && Array.isArray(dataObj.data.workouts)) {
        workoutsArray = dataObj.data.workouts;
      } else if (Array.isArray(dataObj.workouts)) {
        workoutsArray = dataObj.workouts;
      } else if (Array.isArray(dataObj.data)) {
        workoutsArray = dataObj.data;
      }
    }

    console.log("추출된 운동일지 배열:", workoutsArray); // 디버깅용

    // 날짜별 필터링
    const filteredWorkouts = workoutsArray.filter((workout) => {
      const workoutDate = new Date(workout.createdAt)
        .toISOString()
        .split("T")[0];

      console.log(
        `운동일지 날짜: ${workoutDate}, 요청 날짜: ${date}, 일치: ${
          workoutDate === date
        }`
      ); // 디버깅용

      return workoutDate === date;
    });

    console.log("필터링 결과:", filteredWorkouts); // 디버깅용

    return {
      success: true,
      data: filteredWorkouts,
    };
  } catch (error) {
    logError("getWorkoutsByDateApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 특정 운동일지 조회
export const getWorkoutByIdApi = async (
  workoutId: string
): Promise<ApiResponse<WorkoutState>> => {
  try {
    const response = await authApi.get(`/users/me/workouts/${workoutId}`);
    return response.data;
  } catch (error) {
    logError("getWorkoutByIdApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 운동일지 삭제
export const deleteWorkoutApi = async (
  workoutId: string
): Promise<ApiResponse> => {
  try {
    const response = await authApi.delete(`/users/me/workouts/${workoutId}`);
    return response.data;
  } catch (error) {
    logError("deleteWorkoutApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 운동 세부사항 추가
export const addWorkoutDetailApi = async (
  workoutId: string,
  detailData: Omit<
    WorkoutDetailType,
    "_id" | "workoutId" | "createdAt" | "updatedAt"
  >
): Promise<ApiResponse<WorkoutDetailType>> => {
  try {
    const response = await authApi.post(
      `/users/me/workouts/${workoutId}`,
      detailData
    );
    return response.data;
  } catch (error) {
    logError("addWorkoutDetailApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 운동 세부사항 조회
export const getWorkoutDetailApi = async (
  workoutId: string,
  detailId: string
): Promise<ApiResponse<WorkoutDetailType>> => {
  try {
    const response = await authApi.get(
      `/users/me/workouts/${workoutId}/detail/${detailId}`
    );
    return response.data;
  } catch (error) {
    logError("getWorkoutDetailApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 운동 세부사항 수정
export const updateWorkoutDetailApi = async (
  workoutId: string,
  detailId: string,
  detailData: Partial<WorkoutDetailType>
): Promise<ApiResponse<WorkoutDetailType>> => {
  try {
    const response = await authApi.patch(
      `/users/me/workouts/${workoutId}/detail/${detailId}`,
      detailData
    );
    return response.data;
  } catch (error) {
    logError("updateWorkoutDetailApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 운동 세부사항 삭제
export const deleteWorkoutDetailApi = async (
  workoutId: string,
  detailId: string
): Promise<ApiResponse> => {
  try {
    const response = await authApi.delete(
      `/users/me/workouts/${workoutId}/detail/${detailId}`
    );
    return response.data;
  } catch (error) {
    logError("deleteWorkoutDetailApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 레거시 호환성을 위한 함수들 (기존 컴포넌트에서 사용)
export const updateWorkoutApi = async (
  workoutId: string,
  workoutData: Partial<CreateWorkoutRequest>
): Promise<ApiResponse<WorkoutState>> => {
  // 백엔드에 전체 운동일지 수정 API가 없으므로,
  // 필요시 개별 세부사항을 수정하는 방식으로 구현해야 함
  throw new Error(
    "운동일지 전체 수정은 지원되지 않습니다. 개별 세부사항을 수정해주세요."
  );
};

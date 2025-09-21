import authApi from "./auth";
import { getApiErrorMessage, logError } from "../utils";
import {
  ApiResponse,
  WorkoutState,
  WorkoutStatePopulated,
  CreateWorkoutRequest,
  CreateWorkoutDetailRequest,
  WorkoutDetailType,
  UpdateWorkoutRequest,
  UpdateWorkoutDetailRequest,
  UpdateFitnessDetailRequest,
  FitnessDetailState,
} from "../types";

// 날짜를 YYYY-MM-DD 형식으로 변환하는 헬퍼 함수
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 운동일지 생성 (개선된 버전)
export const createWorkoutApi = async (
  workoutData: CreateWorkoutRequest,
  selectedDate?: Date
): Promise<ApiResponse<WorkoutState>> => {
  try {
    let url = "/users/me/workouts";

    // 선택된 날짜가 있으면 쿼리 파라미터로 추가
    if (selectedDate) {
      const dateString = formatDateForAPI(selectedDate);
      url += `?date=${dateString}`;
    }

    const response = await authApi.post(url, workoutData);
    return response.data;
  } catch (error) {
    logError("createWorkoutApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 사용자의 모든 운동일지 조회
export const getUserWorkoutsApi = async (): Promise<
  ApiResponse<WorkoutStatePopulated[]>
> => {
  try {
    const response = await authApi.get("/users/me/workouts");
    return response.data;
  } catch (error) {
    logError("getUserWorkoutsApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 특정 날짜의 운동일지 조회
export const getWorkoutsByDateApi = async (
  date: string
): Promise<ApiResponse<WorkoutStatePopulated[]>> => {
  try {
    const response = await getUserWorkoutsApi();

    // 응답 데이터가 배열인지 확인
    let workoutsArray: WorkoutStatePopulated[] = [];

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

    // 날짜별 필터링
    const filteredWorkouts = workoutsArray.filter((workout) => {
      const workoutDate = new Date(workout.createdAt)
        .toISOString()
        .split("T")[0];

      // 디버깅용

      return workoutDate === date;
    });

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
): Promise<ApiResponse<WorkoutStatePopulated>> => {
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
  detailData: CreateWorkoutDetailRequest
): Promise<ApiResponse<WorkoutDetailType>> => {
  try {
    const response = await authApi.post(`/users/me/workouts/${workoutId}`, {
      details: [detailData],
    });
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

// 헬스 세부사항 추가
export const addFitnessDetailApi = async (
  workoutId: string,
  detailId: string,
  detailData: Partial<CreateWorkoutDetailRequest>
): Promise<ApiResponse<WorkoutDetailType>> => {
  try {
    const response = await authApi.post(
      `/users/me/workouts/${workoutId}/details/${detailId}`,
      { fitnessDetails: detailData.fitnessDetails }
    );
    return response.data;
  } catch (error) {
    logError("addFitnessDetailApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 운동 세부사항 삭제
export const deleteWorkoutDetailApi = async (
  workoutId: string,
  detailId: string
): Promise<ApiResponse> => {
  try {
    const response = await authApi.delete(`/users/me/details/${detailId}`);
    return response.data;
  } catch (error) {
    logError("deleteWorkoutDetailApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 헬스 세부사항 삭제
export const deleteFitnessDetailApi = async (
  fitnessDetailId: string
): Promise<ApiResponse> => {
  try {
    const response = await authApi.delete(
      `/users/me/fitnessdetails/${fitnessDetailId}`
    );
    return response.data;
  } catch (error) {
    logError("deleteFitnessDetailApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 레거시 호환성을 위한 함수들 (기존 컴포넌트에서 사용)
// 운동일지 수정 (백엔드 API 지원)
export const updateWorkoutApi = async (
  workoutId: string,
  workoutData: UpdateWorkoutRequest
): Promise<ApiResponse<WorkoutState>> => {
  try {
    const response = await authApi.patch(`/users/me/workouts/${workoutId}`, {
      workout: workoutData,
    });
    return response.data;
  } catch (error) {
    logError("updateWorkoutApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 운동일지 상세 수정
export const updateWorkoutDetailApi = async (
  workoutId: string,
  workoutDetailId: string,
  detailData: UpdateWorkoutDetailRequest
): Promise<ApiResponse<WorkoutDetailType>> => {
  try {
    const response = await authApi.patch(
      `/users/me/workouts/${workoutId}/details/${workoutDetailId}`,
      { detail: detailData }
    );
    return response.data;
  } catch (error) {
    logError("updateWorkoutDetailApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 피트니스 상세 수정
export const updateFitnessDetailApi = async (
  workoutId: string,
  workoutDetailId: string,
  fitnessDetailId: string,
  fitnessData: UpdateFitnessDetailRequest
): Promise<ApiResponse<FitnessDetailState>> => {
  try {
    const response = await authApi.patch(
      `/users/me/workouts/${workoutId}/details/${workoutDetailId}/fitnessdetails/${fitnessDetailId}`,
      { fitnessDetail: fitnessData }
    );
    return response.data;
  } catch (error) {
    logError("updateFitnessDetailApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 특정 월의 운동일지 조회 (새로운 API)
export const getWorkoutsByMonthApi = async (
  year: number,
  month: number
): Promise<ApiResponse<WorkoutStatePopulated[]>> => {
  try {
    const response = await authApi.get(
      `/users/me/workouts?year=${year}&month=${month}`
    );
    return response.data;
  } catch (error) {
    logError("getWorkoutsByMonthApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

import authApi from "./auth";
import { getApiErrorMessage, logError } from "../utils";
import { ApiResponse } from "../types";
import {
  DietLogResponse,
  DietLogData,
  DietUpdateData,
  MealData,
  FoodUpdateData,
} from "../types/diet";

// 날짜를 YYYY-MM-DD 형식으로 변환하는 헬퍼 함수
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 월별 식단 일지 조회 API
export const getDietLogsByMonthApi = async (
  year: number,
  month: number
): Promise<ApiResponse<DietLogResponse[]>> => {
  try {
    console.log(`월별 식단일지 요청: ${year}년 ${month}월`);
    const response = await authApi.get(
      `/users/me/diets?year=${year}&month=${month}`
    );
    console.log("월별 백엔드 응답 데이터:", response.data);
    return response.data;
  } catch (error) {
    logError("getDietLogsByMonthApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 식단 일지 생성 API
export const createDietLogApi = async (
  dietData: DietLogData,
  selectedDate?: Date
): Promise<ApiResponse<DietLogResponse>> => {
  try {
    let url = "/users/me/diets";

    // 선택된 날짜가 있으면 쿼리 파라미터로 추가
    if (selectedDate) {
      const dateString = formatDateForAPI(selectedDate);
      url += `?date=${dateString}`;
      console.log(`식단일지 생성 요청 - 선택된 날짜: ${dateString}`);
    }

    // 백엔드 DTO에 맞게 데이터 구조 변환
    const meals: Array<{
      dietId: string; // 백엔드에서 처리
      meal_type: string;
      foods: Array<{
        food_name: string;
        food_amount: number;
      }>;
    }> = [];

    // 아침 식사 데이터 변환
    if (dietData.breakfast.length > 0) {
      meals.push({
        dietId: "", // 백엔드에서 처리
        meal_type: "breakfast",
        foods: dietData.breakfast.map((food) => ({
          food_name: food.foodName,
          food_amount: food.amount,
        })),
      });
    }

    // 점심 식사 데이터 변환
    if (dietData.lunch.length > 0) {
      meals.push({
        dietId: "", // 백엔드에서 처리
        meal_type: "lunch",
        foods: dietData.lunch.map((food) => ({
          food_name: food.foodName,
          food_amount: food.amount,
        })),
      });
    }

    // 저녁 식사 데이터 변환
    if (dietData.dinner.length > 0) {
      meals.push({
        dietId: "", // 백엔드에서 처리
        meal_type: "dinner",
        foods: dietData.dinner.map((food) => ({
          food_name: food.foodName,
          food_amount: food.amount,
        })),
      });
    }

    const requestData = {
      diet: {
        meals: meals,
        total_calories: dietData.total_calories,
        feedback: dietData.feedback || "",
        date: dietData.date,
      },
    };

    const response = await authApi.post(url, requestData);

    // 백엔드 응답 구조에 맞게 변환
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data.diet, // 백엔드에서 { data: { diet: newDiet } } 형태로 응답
    };
  } catch (error) {
    logError("createDietLogApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 사용자의 모든 식단일지 조회
export const getUserDietLogsApi = async (): Promise<
  ApiResponse<DietLogResponse[]>
> => {
  try {
    const response = await authApi.get("/users/me/diets");
    console.log("백엔드 응답 데이터:", response.data); // 디버깅용
    return response.data;
  } catch (error) {
    logError("getUserDietLogsApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 특정 날짜의 식단일지 조회
export const getDietLogsByDateApi = async (
  date: string
): Promise<ApiResponse<DietLogResponse[]>> => {
  try {
    const response = await getUserDietLogsApi();

    // 응답 데이터가 배열인지 확인
    let dietLogsArray: DietLogResponse[] = [];

    if (Array.isArray(response.data)) {
      dietLogsArray = response.data;
    } else if (response.data && typeof response.data === "object") {
      // 백엔드 응답 구조에 맞게 수정
      const dataObj = response.data as any;

      // response.data.data.diets 구조 확인
      if (dataObj.data && Array.isArray(dataObj.data.diets)) {
        dietLogsArray = dataObj.data.diets;
      } else if (Array.isArray(dataObj.diets)) {
        dietLogsArray = dataObj.diets;
      } else if (Array.isArray(dataObj.data)) {
        dietLogsArray = dataObj.data;
      }
    }

    // 날짜별 필터링
    const filteredDietLogs = dietLogsArray.filter((dietLog) => {
      const dietLogDate = new Date(dietLog.createdAt)
        .toISOString()
        .split("T")[0];
      return dietLogDate === date;
    });

    return {
      success: true,
      data: filteredDietLogs,
    };
  } catch (error) {
    logError("getDietLogsByDateApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 특정 식단일지 조회
export const getDietLogByIdApi = async (
  dietLogId: string
): Promise<ApiResponse<DietLogResponse>> => {
  try {
    const response = await authApi.get(`/users/me/diets/${dietLogId}`);
    return response.data;
  } catch (error) {
    logError("getDietLogByIdApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 식단일지 수정 API
export const updateDietLogApi = async (
  dietLogId: string,
  dietData: DietUpdateData
): Promise<ApiResponse<DietLogResponse>> => {
  try {
    console.log("수정 API 호출 데이터:", dietData);
    const response = await authApi.patch(`/users/me/diets/${dietLogId}`, {
      diet: dietData,
    });
    return response.data;
  } catch (error) {
    logError("updateDietLogApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 기존 식단일지에 새로운 식사 추가 API
export const addMealToDietLogApi = async (
  dietLogId: string,
  mealType: string,
  foods: Array<{
    food_name: string;
    food_amount: number;
  }>,
  total_calories: number
): Promise<ApiResponse<DietLogResponse>> => {
  try {
    console.log("새 식사 추가 API 호출:", {
      dietLogId,
      mealType,
      foods,
      total_calories,
    });

    // 백엔드 POST API에 맞는 데이터 형식 (여러 형식 시도)
    const requestData = {
      meals: [
        {
          meal_type: mealType,
          foods: foods,
        },
      ],
      total_calories: total_calories,
    };

    const response = await authApi.post(
      `/users/me/diets/${dietLogId}`,
      requestData
    );

    console.log("새 식사 추가 API 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error("새 식사 추가 API 에러 상세:", error);

    logError("addMealToDietLogApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 기존 식사의 특정 식사에 음식 추가 API
export const addFoodToMealApi = async (
  dietLogId: string,
  mealId: string,
  foods: Array<{
    food_name: string;
    food_amount: number;
  }>,
  total_calories: number
): Promise<ApiResponse<DietLogResponse>> => {
  try {
    console.log("음식 추가 API 호출:", {
      dietLogId,
      mealId,
      foods,
      total_calories,
    });

    // 백엔드 API에 맞는 데이터 형식
    const requestData = {
      foods: foods,
      total_calories: total_calories,
    };

    const response = await authApi.post(
      `/users/me/diets/${dietLogId}/meals/${mealId}`,
      requestData
    );

    console.log("음식 추가 API 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error("음식 추가 API 에러 상세:", error);
    console.error("요청 데이터:", {
      dietLogId,
      mealId,
      foods,
      total_calories,
    });
    console.error("에러 응답:", (error as any).response?.data);
    logError("addFoodToMealApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 식단 삭제 API
export const deleteDietLogApi = async (
  dietLogId: string
): Promise<ApiResponse> => {
  try {
    const response = await authApi.delete(`/users/me/diets/${dietLogId}`);
    return response.data;
  } catch (error) {
    logError("deleteDietLogApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// meal 삭제 API
export const deleteMealApi = async (
  dietLogId: string,
  mealId: string
): Promise<ApiResponse> => {
  try {
    const response = await authApi.delete(
      `/users/me/diets/${dietLogId}/meals/${mealId}`
    );
    return response.data;
  } catch (error) {
    logError("deleteMealApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// food 삭제 API
export const deleteFoodApi = async (
  dietLogId: string,
  mealId: string,
  foodId: string
): Promise<ApiResponse> => {
  try {
    const response = await authApi.delete(
      `/users/me/diets/${dietLogId}/meals/${mealId}/foods/${foodId}`
    );
    return response.data;
  } catch (error) {
    logError("deleteFoodApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 식단일지 통계 조회 API (월별 총 칼로리, 평균 등)
export const getDietStatsApi = async (
  year: number,
  month: number
): Promise<
  ApiResponse<{
    totalCalories: number;
    averageCalories: number;
    totalDays: number;
    loggedDays: number;
  }>
> => {
  try {
    const response = await authApi.get("/users/me/diets/stats", {
      params: {
        year,
        month,
      },
    });
    return response.data;
  } catch (error) {
    logError("getDietStatsApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

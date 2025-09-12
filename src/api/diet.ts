import axios from "axios";
import { API_CONFIG, AUTH_CONSTANTS } from "../constants";
import { getApiErrorMessage, logError } from "../utils";
import { ApiResponse } from "../types";

// axios 인스턴스 생성 및 기본 설정
const dietApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// 요청 인터셉터 (요청 전 처리)
dietApi.interceptors.request.use(
  (config) => {
    // 세션ID가 있다면 헤더에 추가
    const sessionId = localStorage.getItem(AUTH_CONSTANTS.SESSION_ID_KEY);
    console.log(
      "Diet API 요청 인터셉터 - 세션 ID:",
      sessionId,
      "URL:",
      config.url
    );

    if (sessionId) {
      config.headers["x-session-id"] = sessionId;
      console.log("Authorization 헤더 설정:", `Bearer ${sessionId}`);
    } else {
      console.log("세션 ID가 없어 Authorization 헤더를 설정하지 않음");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (응답 후 처리)
dietApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 에러 시 세션ID 제거 및 Zustand 스토어 동기화
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_CONSTANTS.SESSION_ID_KEY);
      localStorage.removeItem(AUTH_CONSTANTS.USER_NAME_KEY);

      // 페이지가 로드된 후에만 Zustand 스토어 업데이트
      if (typeof window !== "undefined") {
        // 이벤트를 발생시켜 Zustand 스토어가 업데이트되도록 함
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);

// 식단 일지 데이터 타입 정의
export interface DietLogData {
  date: string; // YYYY-MM-DD 형식
  breakfast: MealData[];
  lunch: MealData[];
  dinner: MealData[];
  totalCalories: number;
  feedback?: string;
}

export interface MealData {
  foodId: string;
  foodName: string;
  calories: number; // 100g 기준 칼로리
  amount: number; // 섭취량 (그람 단위)
  totalCalories: number; // 계산된 총 칼로리
}

export interface DietLogResponse {
  _id: string;
  userId: string;
  date: string;
  breakfast: MealData[];
  lunch: MealData[];
  dinner: MealData[];
  totalCalories: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

// 월별 식단 일지 조회 API
export const fetchDietLogsByMonth = async (
  year: number,
  month: number
): Promise<ApiResponse<DietLogResponse[]>> => {
  try {
    const response = await dietApi.get("/users/me/diets", {
      params: {
        year,
        month,
      },
    });
    return response.data;
  } catch (error) {
    logError("fetchDietLogsByMonth", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 식단 일지 생성 API (1단계: 식단 일지 생성)
export const createDiet = async (
  date: string
): Promise<ApiResponse<{ dietId: string }>> => {
  try {
    const requestData = { diet: { date } };
    console.log("createDiet 요청 데이터:", requestData);

    const response = await dietApi.post("/users/me/diets", requestData);
    console.log("createDiet 응답:", response.data);

    return response.data;
  } catch (error) {
    console.error("createDiet 에러:", error);
    logError("createDiet", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 식사 생성 API (2단계: 아침/점심/저녁 생성)
export const createMeal = async (
  dietId: string,
  mealType: "breakfast" | "lunch" | "dinner"
): Promise<ApiResponse<{ mealId: string }>> => {
  try {
    const requestData = { meal: { mealType } };
    console.log(`createMeal 요청 데이터 (dietId: ${dietId}):`, requestData);

    const response = await dietApi.post(
      `/users/me/diets/${dietId}`,
      requestData
    );
    console.log("createMeal 응답:", response.data);

    return response.data;
  } catch (error) {
    console.error("createMeal 에러:", error);
    logError("createMeal", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 음식 생성 API (3단계: 음식 추가)
export const createFood = async (
  dietId: string,
  mealId: string,
  foodData: {
    foodId: string;
    foodName: string;
    calories: number;
    amount: number;
    totalCalories: number;
  }
): Promise<ApiResponse<{ foodId: string }>> => {
  try {
    const requestData = { food: foodData };
    console.log(
      `createFood 요청 데이터 (dietId: ${dietId}, mealId: ${mealId}):`,
      requestData
    );

    const response = await dietApi.post(
      `/users/me/diets/${dietId}/meals/${mealId}`,
      requestData
    );
    console.log("createFood 응답:", response.data);

    return response.data;
  } catch (error) {
    console.error("createFood 에러:", error);
    logError("createFood", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 통합 식단 일지 생성 API (한번에 모든 데이터 전송)
export const createDietLog = async (
  logData: DietLogData
): Promise<ApiResponse<DietLogResponse>> => {
  try {
    console.log("createDietLog 시작:", logData);

    // 백엔드 DTO에 맞게 데이터 구조 변환
    const meals: Array<{
      dietId: string; // 임시값, 백엔드에서 처리
      meal_type: string;
      foods: Array<{
        food_name: string;
        food_amount: number;
      }>;
    }> = [];

    // 아침 식사 데이터 변환
    if (logData.breakfast.length > 0) {
      meals.push({
        dietId: "", // 백엔드에서 처리
        meal_type: "breakfast",
        foods: logData.breakfast.map((food) => ({
          food_name: food.foodName,
          food_amount: food.amount,
        })),
      });
    }

    // 점심 식사 데이터 변환
    if (logData.lunch.length > 0) {
      meals.push({
        dietId: "", // 백엔드에서 처리
        meal_type: "lunch",
        foods: logData.lunch.map((food) => ({
          food_name: food.foodName,
          food_amount: food.amount,
        })),
      });
    }

    // 저녁 식사 데이터 변환
    if (logData.dinner.length > 0) {
      meals.push({
        dietId: "", // 백엔드에서 처리
        meal_type: "dinner",
        foods: logData.dinner.map((food) => ({
          food_name: food.foodName,
          food_amount: food.amount,
        })),
      });
    }

    const requestData = {
      diet: {
        meals: meals,
        total_calories: logData.totalCalories,
        feedback: "", // 선택사항
        date: logData.date,
      },
    };

    console.log("createDietLog 요청 데이터:", requestData);

    const response = await dietApi.post("/users/me/diets", requestData);
    console.log("createDietLog 응답:", response.data);

    // 백엔드 응답 구조에 맞게 변환
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data.diet, // 백엔드에서 { data: { diet: newDiet } } 형태로 응답
    };
  } catch (error) {
    console.error("createDietLog 에러:", error);
    logError("createDietLog", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 식단 일지 수정 API
export const updateDietLog = async (
  logId: string,
  logData: Partial<DietLogData>
): Promise<ApiResponse<DietLogResponse>> => {
  try {
    const response = await dietApi.put(`/users/me/diets/${logId}`, {
      diet: logData,
    });
    return response.data;
  } catch (error) {
    logError("updateDietLog", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 식단 일지 삭제 API
export const deleteDietLog = async (
  logId: string
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await dietApi.delete(`/users/me/diets/${logId}`);
    return response.data;
  } catch (error) {
    logError("deleteDietLog", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 특정 날짜의 식단 일지 조회 API
export const fetchDietLogByDate = async (
  date: string
): Promise<ApiResponse<DietLogResponse | null>> => {
  try {
    const response = await dietApi.get(`/users/me/diets/date/${date}`);
    return response.data;
  } catch (error) {
    logError("fetchDietLogByDate", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 식단 일지 통계 조회 API (월별 총 칼로리, 평균 등)
export const fetchDietStats = async (
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
    const response = await dietApi.get("/users/me/diets/stats", {
      params: {
        year,
        month,
      },
    });
    return response.data;
  } catch (error) {
    logError("fetchDietStats", error);
    throw new Error(getApiErrorMessage(error));
  }
};

export default dietApi;

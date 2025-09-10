import axios from "axios";
import { getApiErrorMessage, logError } from "../utils";
import { API_CONFIG } from "../constants";
import { FoodSearchResultItem } from "../types/diet";

// 식품영양성분DB API 설정 (공공데이터포털 직접 호출용)
const FOOD_API_CONFIG = {
  BASE_URL: "https://api.data.go.kr/openapi/tn_pubr_public_nutri_food_info_api",
  SERVICE_NAME: "I2790", // 식품영양성분DB 서비스명
  TYPE: "json",
  PAGE_SIZE: 100, // 한 번에 가져올 최대 개수
} as const;

// 백엔드 API 설정
const BACKEND_FOOD_API_CONFIG = {
  BASE_URL: API_CONFIG.BASE_URL,
  ENDPOINT: "/api/foods/search",
} as const;

// API 키 (환경 변수에서 가져오기)
const API_KEY = process.env.REACT_APP_FOOD_API_KEY;

// 식품 영양성분 정보 인터페이스
export interface FoodItem {
  DESC_KOR: string; // 식품명
  NUTR_CONT1: string; // 열량 (kcal)
  NUTR_CONT2: string; // 탄수화물 (g)
  NUTR_CONT3: string; // 단백질 (g)
  NUTR_CONT4: string; // 지방 (g)
  NUTR_CONT5: string; // 당류 (g)
  NUTR_CONT6: string; // 나트륨 (mg)
  NUTR_CONT7: string; // 콜레스테롤 (mg)
  NUTR_CONT8: string; // 포화지방산 (g)
  NUTR_CONT9: string; // 트랜스지방산 (g)
  SERVING_SIZE: string; // 1회 제공량
  SERVING_UNIT: string; // 단위
  GROUP_NAME: string; // 식품군
  MAKER_NAME: string; // 제조사명
}

// API 응답 인터페이스
interface FoodApiResponse {
  I2790: {
    RESULT: {
      CODE: string;
      MSG: string;
    };
    row: FoodItem[];
  };
}

// 음식 이름으로 식품 검색
export const searchFoodByName = async (
  foodName: string
): Promise<FoodItem[]> => {
  // API 키 검증
  if (!API_KEY) {
    throw new Error(
      "식품영양성분DB API 키가 설정되지 않았습니다. REACT_APP_FOOD_API_KEY 환경 변수를 확인해주세요."
    );
  }

  // 검색어 검증
  if (!foodName || foodName.trim().length === 0) {
    throw new Error("검색할 음식 이름을 입력해주세요.");
  }

  try {
    // API URL 구성
    const url = `${FOOD_API_CONFIG.BASE_URL}/${API_KEY}/${FOOD_API_CONFIG.SERVICE_NAME}/${FOOD_API_CONFIG.TYPE}/1/${FOOD_API_CONFIG.PAGE_SIZE}`;

    // 요청 파라미터
    const params = {
      DESC_KOR: foodName.trim(), // 식품명으로 검색
    };

    console.log("식품 검색 API 요청:", { url, params });

    // API 요청
    const response = await axios.get<FoodApiResponse>(url, {
      params,
      timeout: 10000, // 10초 타임아웃
    });

    // 응답 검증
    if (!response.data || !response.data.I2790) {
      throw new Error("API 응답 형식이 올바르지 않습니다.");
    }

    const { RESULT, row } = response.data.I2790;

    // API 에러 체크
    if (RESULT.CODE !== "INFO-000") {
      throw new Error(`API 오류: ${RESULT.MSG} (코드: ${RESULT.CODE})`);
    }

    // 검색 결과 반환
    const searchResults = row || [];
    console.log(`"${foodName}" 검색 결과: ${searchResults.length}개`);

    return searchResults;
  } catch (error) {
    logError("searchFoodByName", error);

    // axios 에러 처리
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        throw new Error("요청 시간이 초과되었습니다. 다시 시도해주세요.");
      }
      if (error.response?.status === 401) {
        throw new Error("API 키가 유효하지 않습니다. API 키를 확인해주세요.");
      }
      if (error.response?.status === 403) {
        throw new Error(
          "API 접근 권한이 없습니다. API 키 권한을 확인해주세요."
        );
      }
      if (error.response?.status === 500) {
        throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }

    // 일반 에러 처리
    throw new Error(getApiErrorMessage(error));
  }
};

// 식품 영양성분 정보를 숫자로 변환하는 헬퍼 함수
export const parseNutritionValue = (value: string): number => {
  if (!value || value === "-" || value === "N/A") {
    return 0;
  }

  // 숫자가 아닌 문자 제거 (단위, 특수문자 등)
  const numericValue = value.replace(/[^\d.-]/g, "");
  const parsed = parseFloat(numericValue);

  return isNaN(parsed) ? 0 : parsed;
};

// 식품 정보를 사용하기 쉬운 형태로 변환하는 헬퍼 함수
export const formatFoodItem = (item: FoodItem) => {
  return {
    name: item.DESC_KOR,
    calories: parseNutritionValue(item.NUTR_CONT1),
    carbohydrates: parseNutritionValue(item.NUTR_CONT2),
    protein: parseNutritionValue(item.NUTR_CONT3),
    fat: parseNutritionValue(item.NUTR_CONT4),
    sugar: parseNutritionValue(item.NUTR_CONT5),
    sodium: parseNutritionValue(item.NUTR_CONT6),
    cholesterol: parseNutritionValue(item.NUTR_CONT7),
    saturatedFat: parseNutritionValue(item.NUTR_CONT8),
    transFat: parseNutritionValue(item.NUTR_CONT9),
    servingSize: item.SERVING_SIZE,
    servingUnit: item.SERVING_UNIT,
    groupName: item.GROUP_NAME,
    makerName: item.MAKER_NAME,
  };
};

// 백엔드 API를 통한 음식 검색 (CORS 문제 해결)
export const searchFoodByNameApi = async (
  keyword: string
): Promise<FoodSearchResultItem[]> => {
  // 검색어 검증
  if (!keyword || keyword.trim().length === 0) {
    throw new Error("검색할 음식 이름을 입력해주세요.");
  }

  try {
    // 백엔드 API URL 구성
    const url = `${BACKEND_FOOD_API_CONFIG.BASE_URL}${BACKEND_FOOD_API_CONFIG.ENDPOINT}`;

    // 요청 파라미터
    const params = {
      keyword: keyword.trim(),
    };

    console.log("백엔드 음식 검색 API 요청:", { url, params });

    // 백엔드 API 요청
    const response = await axios.get<FoodSearchResultItem[]>(url, {
      params,
      timeout: 10000, // 10초 타임아웃
    });

    // 응답 검증
    if (!Array.isArray(response.data)) {
      throw new Error("API 응답 형식이 올바르지 않습니다.");
    }

    // 검색 결과 반환
    const searchResults = response.data || [];
    console.log(`"${keyword}" 검색 결과: ${searchResults.length}개`);

    return searchResults;
  } catch (error) {
    logError("searchFoodByNameApi", error);

    // axios 에러 처리
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        throw new Error("요청 시간이 초과되었습니다. 다시 시도해주세요.");
      }
      if (error.response?.status === 401) {
        throw new Error("인증이 필요합니다. 로그인해주세요.");
      }
      if (error.response?.status === 403) {
        throw new Error("접근 권한이 없습니다.");
      }
      if (error.response?.status === 404) {
        throw new Error("음식 검색 서비스를 찾을 수 없습니다.");
      }
      if (error.response && error.response.status >= 500) {
        throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }

    // 일반 에러 처리
    throw new Error(getApiErrorMessage(error));
  }
};

export default {
  searchFoodByName,
  searchFoodByNameApi,
  parseNutritionValue,
  formatFoodItem,
};

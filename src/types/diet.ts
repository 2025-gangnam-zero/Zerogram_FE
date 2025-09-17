// 식단 일지(전체)
export interface DietState {
  _id: string;
  userId: string;
  date: string;
  meals: MealState[]; // 아침, 점심, 저녁, 간식
  total_calories: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 식단 일지 응답 (프론트엔드에서 사용)
export interface DietLogResponse {
  _id: string;
  date: string;
  breakfast: FoodState[];
  lunch: FoodState[];
  dinner: FoodState[];
  snack: FoodState[];
  total_calories: number;
  feedback: string;
  createdAt: string;
  updatedAt: string;
}

// 식단 상세 정보(음식정보)
export interface MealState {
  _id: string;
  dietId: string;
  meal_type?: string;
  foods: FoodState[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodState {
  _id: string;
  mealId: string;
  food_name: string;
  food_amount?: number;
  createdAt: string;
  updatedAt: string;
}

// API 전송용 식단 일지 데이터 타입 (생성용)
export interface DietLogData {
  date: string; // YYYY-MM-DD 형식
  breakfast: MealData[];
  lunch: MealData[];
  dinner: MealData[];
  total_calories: number;
  feedback?: string;
}

// API 전송용 식단 일지 수정 타입 (백엔드 DTO와 일치)
export interface DietUpdateData {
  feedback?: string;
  total_calories?: number;
  meals?: MealUpdateData[];
}

// API 전송용 음식 데이터 타입 (생성용)
export interface MealData {
  _id?: string;
  meal_type?: string;
  foodId: string;
  foodName: string;
  calories: number; // 100g 기준 칼로리
  amount: number; // 섭취량 (그람 단위)
  total_calories: number; // 계산된 총 칼로리
}

// API 전송용 Meal 수정 데이터 타입 (백엔드 DTO와 일치)
export interface MealUpdateData {
  _id: string; // 백엔드 MealUpdateRequestDto와 일치
  meal_type?: string;
  foods?: FoodUpdateData[];
}

// API 전송용 Food 수정 데이터 타입 (백엔드 DTO와 일치)
export interface FoodUpdateData {
  _id: string; // 백엔드 FoodUpdateRequestDto와 일치
  food_name?: string;
  food_amount?: number;
  total_calories?: number;
}

// 모달에서 선택된 음식 타입
export interface SelectedFood {
  uniqueId: number; // 고유 식별자
  foodId: string; // Food의 _id
  foodName: string;
  calories: number; // 100g 기준 칼로리
  amount: number; // 섭취량 (그람 단위)
  total_calories: number; // 계산된 총 칼로리
  mealId?: string; // 수정 시 해당 Meal의 _id (선택적)
}

// 식사 시간 타입
export type MealType = "breakfast" | "lunch" | "dinner";

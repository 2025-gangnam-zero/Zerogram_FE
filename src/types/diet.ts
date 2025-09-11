// 식단 일지(전체)
export interface DietState {
  _id: string;
  userId: string;
  meals: MealState[]; // 아침, 점심, 저녁, 간식
  total_calories: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 식단 상세 정보(음식정보)
export interface MealState {
  _id: string;
  dietId: string;
  meal_type?: string; // 아침, 점심, 저녁, 간식
  food_name: string;
  food_amount?: number;
  createdAt: Date;
  updatedAt: Date;
}

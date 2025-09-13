import { useCallback, useMemo } from "react";
import foodData from "../data/food.json";

// food.json의 데이터 구조에 맞는 타입 정의
interface FoodItem {
  foodId: string;
  foodName: string;
  calories: number;
}

// 검색 결과 타입
interface SearchResult {
  foodId: string;
  foodName: string;
  calories: number;
}

// 훅의 반환 타입
interface UseFoodSearchReturn {
  search: (keyword: string) => SearchResult[];
  getAllFoods: () => SearchResult[];
  getFoodById: (foodId: string) => SearchResult | undefined;
}

export const useFoodSearch = (): UseFoodSearchReturn => {
  // food.json 데이터를 메모이제이션하여 성능 최적화
  const foods = useMemo(() => {
    return foodData as FoodItem[];
  }, []);

  // 검색 함수 - 키워드가 음식 이름에 포함된 모든 음식을 반환
  const search = useCallback(
    (keyword: string): SearchResult[] => {
      if (!keyword.trim()) {
        return [];
      }

      const normalizedKeyword = keyword.toLowerCase().trim();

      return foods
        .filter((food) =>
          food.foodName.toLowerCase().includes(normalizedKeyword)
        )
        .map((food) => ({
          foodId: food.foodId,
          foodName: food.foodName,
          calories: food.calories,
        }));
    },
    [foods]
  );

  // 모든 음식 데이터 반환
  const getAllFoods = useCallback((): SearchResult[] => {
    return foods.map((food) => ({
      foodId: food.foodId,
      foodName: food.foodName,
      calories: food.calories,
    }));
  }, [foods]);

  // ID로 특정 음식 찾기
  const getFoodById = useCallback(
    (foodId: string): SearchResult | undefined => {
      const food = foods.find((food) => food.foodId === foodId);
      return food
        ? {
            foodId: food.foodId,
            foodName: food.foodName,
            calories: food.calories,
          }
        : undefined;
    },
    [foods]
  );

  return {
    search,
    getAllFoods,
    getFoodById,
  };
};

export default useFoodSearch;

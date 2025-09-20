import React from "react";
import styled from "styled-components";
import Card from "../common/Card";
import { UI_CONSTANTS } from "../../constants";
import { DietLogResponse } from "../../types/diet";
import foodData from "../../data/food.json";

interface DietLogCardProps {
  dietLog: DietLogResponse;
  onClick: () => void;
}

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${UI_CONSTANTS.SPACING.SM};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
`;

const DateText = styled.span`
  font-size: 0.9rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-weight: 500;
`;

const CalorieBadge = styled.span`
  background: ${UI_CONSTANTS.COLORS.PRIMARY};
  color: white;
  padding: 4px 8px;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
  font-size: 0.8rem;
  font-weight: 600;
`;

const MealSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MealItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
`;

const MealType = styled.span`
  font-weight: 500;
`;

const MealCalories = styled.span`
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const TotalCalories = styled.div`
  text-align: center;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.PRIMARY};
  font-size: 1.1rem;
  margin-top: ${UI_CONSTANTS.SPACING.SM};
  padding-top: ${UI_CONSTANTS.SPACING.SM};
  border-top: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
`;

const DietLogCard: React.FC<DietLogCardProps> = ({ dietLog, onClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  const getMealCalories = (mealType: keyof DietLogResponse) => {
    const meal = dietLog[mealType] as any[];
    if (!meal || meal.length === 0) return 0;

    return meal.reduce((sum, food) => {
      // food.json에서 해당 음식의 칼로리 정보 찾기
      const foodInfo = foodData.find((f) => f.foodName === food.food_name);
      if (foodInfo) {
        // 100g 기준 칼로리 * (섭취량 / 100)
        const calories = (foodInfo.calories * (food.food_amount || 0)) / 100;
        return sum + calories;
      }
      return sum;
    }, 0);
  };

  const breakfastCalories = getMealCalories("breakfast");
  const lunchCalories = getMealCalories("lunch");
  const dinnerCalories = getMealCalories("dinner");
  const totalCalculatedCalories =
    breakfastCalories + lunchCalories + dinnerCalories;

  return (
    <Card onClick={onClick}>
      <CardContent>
        <CardHeader>
          <DateText>{formatDate(dietLog.date)}</DateText>
          <CalorieBadge>식단일지</CalorieBadge>
        </CardHeader>

        <MealSummary>
          <MealItem>
            <MealType>아침</MealType>
            <MealCalories>{Math.round(breakfastCalories)} kcal</MealCalories>
          </MealItem>
          <MealItem>
            <MealType>점심</MealType>
            <MealCalories>{Math.round(lunchCalories)} kcal</MealCalories>
          </MealItem>
          <MealItem>
            <MealType>저녁</MealType>
            <MealCalories>{Math.round(dinnerCalories)} kcal</MealCalories>
          </MealItem>
        </MealSummary>

        <TotalCalories>
          총 {Math.round(totalCalculatedCalories)} kcal
        </TotalCalories>
      </CardContent>
    </Card>
  );
};

export default DietLogCard;

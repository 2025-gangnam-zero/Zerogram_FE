import React, { useState } from "react";
import styled from "styled-components";
import { useDietStore } from "../../store";
import { UI_CONSTANTS } from "../../constants";
import Modal from "../common/Modal";
import Button from "../common/Button";
import FoodSearch from "./FoodSearch";

// 선택된 음식 타입
interface SelectedFood {
  foodId: string;
  foodName: string;
  calories: number; // 100g 기준 칼로리
  amount: number; // 섭취량 (그람 단위)
  totalCalories: number; // 계산된 총 칼로리
}

// 식사 시간 타입
type MealType = "breakfast" | "lunch" | "dinner";

const ModalContent = styled.div`
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  margin-bottom: ${UI_CONSTANTS.SPACING.XL};
  text-align: center;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
`;

const SelectedDate = styled.div`
  font-size: 1.1rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const MealTypeSection = styled.div`
  margin-bottom: ${UI_CONSTANTS.SPACING.XL};
`;

const MealTypeLabel = styled.label`
  font-size: 1.1rem;
  font-weight: 500;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin-bottom: ${UI_CONSTANTS.SPACING.MD};
  display: block;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: ${UI_CONSTANTS.SPACING.LG};
  flex-wrap: wrap;
`;

const RadioItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONSTANTS.SPACING.SM};
`;

const RadioInput = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const RadioLabel = styled.label`
  font-size: 1rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  cursor: pointer;
`;

const FoodSearchSection = styled.div`
  margin-bottom: ${UI_CONSTANTS.SPACING.XL};
`;

const FoodSearchLabel = styled.label`
  font-size: 1.1rem;
  font-weight: 500;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin-bottom: ${UI_CONSTANTS.SPACING.MD};
  display: block;
`;

const AmountInput = styled.input`
  width: 80px;
  padding: ${UI_CONSTANTS.SPACING.SM};
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
  font-size: 0.9rem;
  text-align: center;

  &:focus {
    outline: none;
    border-color: ${UI_CONSTANTS.COLORS.PRIMARY};
  }
`;

const AmountLabel = styled.span`
  font-size: 0.9rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  margin-left: ${UI_CONSTANTS.SPACING.SM};
`;

// const TotalCalories = styled.div`
//   font-weight: bold;
//   color: ${UI_CONSTANTS.COLORS.PRIMARY};
// `;

const MealSection = styled.div`
  margin-bottom: ${UI_CONSTANTS.SPACING.XL};
  padding: ${UI_CONSTANTS.SPACING.MD};
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  background: ${UI_CONSTANTS.COLORS.LIGHT};
`;

const MealTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: bold;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin-bottom: ${UI_CONSTANTS.SPACING.MD};
`;

const MealFoodsList = styled.div`
  max-height: 150px;
  overflow-y: auto;
  margin-bottom: ${UI_CONSTANTS.SPACING.MD};
`;

const MealFoodItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${UI_CONSTANTS.SPACING.SM};
  border-bottom: 1px solid ${UI_CONSTANTS.COLORS.BORDER};

  &:last-child {
    border-bottom: none;
  }
`;

const MealFoodInfo = styled.div`
  flex: 1;
`;

const MealFoodName = styled.div`
  font-weight: 500;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  font-size: 0.9rem;
`;

const MealFoodCalories = styled.div`
  font-size: 0.8rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const MealTotal = styled.div`
  text-align: right;
  font-weight: bold;
  color: ${UI_CONSTANTS.COLORS.PRIMARY};
  border-top: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  padding-top: ${UI_CONSTANTS.SPACING.SM};
`;

const AllMealsTotal = styled.div`
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: ${UI_CONSTANTS.COLORS.PRIMARY};
  margin: ${UI_CONSTANTS.SPACING.LG} 0;
  padding: ${UI_CONSTANTS.SPACING.MD};
  background: ${UI_CONSTANTS.COLORS.LIGHT};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
`;

const RemoveButton = styled.button`
  background: ${UI_CONSTANTS.COLORS.DANGER};
  color: white;
  border: none;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
  padding: ${UI_CONSTANTS.SPACING.SM} ${UI_CONSTANTS.SPACING.MD};
  cursor: pointer;
  font-size: 0.9rem;
  transition: ${UI_CONSTANTS.TRANSITIONS.FAST};

  &:hover {
    background: ${UI_CONSTANTS.COLORS.DANGER_HOVER};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${UI_CONSTANTS.SPACING.MD};
  justify-content: flex-end;
  margin-top: ${UI_CONSTANTS.SPACING.XL};
`;

const DietLogModal: React.FC = () => {
  const { isModalOpen, closeModal, selectedDate } = useDietStore();

  // 로컬 상태 - 각 식사별로 음식 목록 관리
  const [breakfastFoods, setBreakfastFoods] = useState<SelectedFood[]>([]);
  const [lunchFoods, setLunchFoods] = useState<SelectedFood[]>([]);
  const [dinnerFoods, setDinnerFoods] = useState<SelectedFood[]>([]);
  const [currentMealType, setCurrentMealType] = useState<MealType>("breakfast");

  // 날짜 포맷팅 함수
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}년 ${month}월 ${day}일`;
  };

  // 칼로리 계산 함수 (100g 기준을 실제 섭취량으로 계산)
  const calculateTotalCalories = (
    caloriesPer100g: number,
    amount: number
  ): number => {
    return Math.round((caloriesPer100g * amount) / 100);
  };

  // 음식 선택 핸들러
  const handleFoodSelect = (food: {
    foodId: string;
    foodName: string;
    calories: number;
  }) => {
    const newFood: SelectedFood = {
      ...food,
      amount: 100, // 기본 섭취량 100g
      totalCalories: calculateTotalCalories(food.calories, 100),
    };

    // 현재 선택된 식사 시간에 따라 해당 배열에 추가
    switch (currentMealType) {
      case "breakfast":
        setBreakfastFoods((prev) => [...prev, newFood]);
        break;
      case "lunch":
        setLunchFoods((prev) => [...prev, newFood]);
        break;
      case "dinner":
        setDinnerFoods((prev) => [...prev, newFood]);
        break;
    }
  };

  // 음식 제거 핸들러
  const handleRemoveFood = (foodId: string, mealType: MealType) => {
    switch (mealType) {
      case "breakfast":
        setBreakfastFoods((prev) =>
          prev.filter((food) => food.foodId !== foodId)
        );
        break;
      case "lunch":
        setLunchFoods((prev) => prev.filter((food) => food.foodId !== foodId));
        break;
      case "dinner":
        setDinnerFoods((prev) => prev.filter((food) => food.foodId !== foodId));
        break;
    }
  };

  // 섭취량 변경 핸들러
  const handleAmountChange = (
    foodId: string,
    mealType: MealType,
    newAmount: number
  ) => {
    const updateFood = (foods: SelectedFood[]) =>
      foods.map((food) =>
        food.foodId === foodId
          ? {
              ...food,
              amount: newAmount,
              totalCalories: calculateTotalCalories(food.calories, newAmount),
            }
          : food
      );

    switch (mealType) {
      case "breakfast":
        setBreakfastFoods(updateFood);
        break;
      case "lunch":
        setLunchFoods(updateFood);
        break;
      case "dinner":
        setDinnerFoods(updateFood);
        break;
    }
  };

  // 저장 핸들러
  const handleSave = () => {
    // TODO: API 호출로 저장 로직 구현
    console.log("저장할 데이터:", {
      date: selectedDate,
      breakfast: breakfastFoods,
      lunch: lunchFoods,
      dinner: dinnerFoods,
      totalCalories: getTotalCalories(),
    });

    // 저장 후 모달 닫기
    closeModal();
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    // 상태 초기화
    setBreakfastFoods([]);
    setLunchFoods([]);
    setDinnerFoods([]);
    setCurrentMealType("breakfast");
    closeModal();
  };

  // 각 식사별 총 칼로리 계산
  const getMealTotalCalories = (foods: SelectedFood[]): number => {
    return foods.reduce((total, food) => total + food.totalCalories, 0);
  };

  // 전체 총 칼로리 계산
  const getTotalCalories = (): number => {
    return (
      getMealTotalCalories(breakfastFoods) +
      getMealTotalCalories(lunchFoods) +
      getMealTotalCalories(dinnerFoods)
    );
  };

  // 식사별 음식 목록 렌더링
  const renderMealSection = (
    mealType: MealType,
    foods: SelectedFood[],
    mealName: string
  ) => {
    const totalCalories = getMealTotalCalories(foods);

    return (
      <MealSection key={mealType}>
        <MealTitle>
          {mealName} ({totalCalories} kcal)
        </MealTitle>
        <MealFoodsList>
          {foods.length > 0 ? (
            foods.map((food) => (
              <MealFoodItem key={food.foodId}>
                <MealFoodInfo>
                  <MealFoodName>{food.foodName}</MealFoodName>
                  <MealFoodCalories>
                    {food.calories} kcal/100g × {food.amount}g ={" "}
                    {food.totalCalories} kcal
                  </MealFoodCalories>
                </MealFoodInfo>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <AmountInput
                    type="number"
                    value={food.amount}
                    onChange={(e) =>
                      handleAmountChange(
                        food.foodId,
                        mealType,
                        Number(e.target.value)
                      )
                    }
                    min="1"
                    step="1"
                  />
                  <AmountLabel>g</AmountLabel>
                  <RemoveButton
                    onClick={() => handleRemoveFood(food.foodId, mealType)}
                  >
                    제거
                  </RemoveButton>
                </div>
              </MealFoodItem>
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                color: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
                fontStyle: "italic",
                padding: "20px",
              }}
            >
              선택된 음식이 없습니다.
            </div>
          )}
        </MealFoodsList>
        {totalCalories > 0 && <MealTotal>총 {totalCalories} kcal</MealTotal>}
      </MealSection>
    );
  };

  return (
    <Modal isOpen={isModalOpen} onClose={handleClose} title="식단 일지 작성">
      <ModalContent>
        <ModalHeader>
          <ModalTitle>식단 일지 작성</ModalTitle>
          <SelectedDate>{formatDate(selectedDate)}</SelectedDate>
        </ModalHeader>

        <MealTypeSection>
          <MealTypeLabel>음식을 추가할 식사 시간 선택</MealTypeLabel>
          <RadioGroup>
            <RadioItem>
              <RadioInput
                type="radio"
                id="breakfast"
                name="mealType"
                value="breakfast"
                checked={currentMealType === "breakfast"}
                onChange={(e) => setCurrentMealType(e.target.value as MealType)}
              />
              <RadioLabel htmlFor="breakfast">아침</RadioLabel>
            </RadioItem>
            <RadioItem>
              <RadioInput
                type="radio"
                id="lunch"
                name="mealType"
                value="lunch"
                checked={currentMealType === "lunch"}
                onChange={(e) => setCurrentMealType(e.target.value as MealType)}
              />
              <RadioLabel htmlFor="lunch">점심</RadioLabel>
            </RadioItem>
            <RadioItem>
              <RadioInput
                type="radio"
                id="dinner"
                name="mealType"
                value="dinner"
                checked={currentMealType === "dinner"}
                onChange={(e) => setCurrentMealType(e.target.value as MealType)}
              />
              <RadioLabel htmlFor="dinner">저녁</RadioLabel>
            </RadioItem>
          </RadioGroup>
        </MealTypeSection>

        <FoodSearchSection>
          <FoodSearchLabel>음식 검색 (100g 기준 칼로리)</FoodSearchLabel>
          <FoodSearch onFoodSelect={handleFoodSelect} />
        </FoodSearchSection>

        {/* 아침 식사 섹션 */}
        {renderMealSection("breakfast", breakfastFoods, "아침")}

        {/* 점심 식사 섹션 */}
        {renderMealSection("lunch", lunchFoods, "점심")}

        {/* 저녁 식사 섹션 */}
        {renderMealSection("dinner", dinnerFoods, "저녁")}

        {/* 전체 총 칼로리 */}
        <AllMealsTotal>하루 총 칼로리: {getTotalCalories()} kcal</AllMealsTotal>

        <ButtonGroup>
          <Button variant="secondary" onClick={handleClose}>
            닫기
          </Button>
          <Button variant="primary" onClick={handleSave}>
            생성
          </Button>
        </ButtonGroup>
      </ModalContent>
    </Modal>
  );
};

export default DietLogModal;

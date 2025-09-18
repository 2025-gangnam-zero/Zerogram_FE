import React, { useState } from "react";
import styled from "styled-components";
import { useDietStore } from "../../store";
import { UI_CONSTANTS } from "../../constants";
import Modal from "../common/Modal";
import Button from "../common/Button";
import FoodSearch from "./FoodSearch";
import {
  DietLogData,
  SelectedFood,
  MealType,
  DietUpdateData,
  MealUpdateData,
  FoodUpdateData,
} from "../../types/diet";
import foodData from "../../data/food.json";

// 타입들은 types/diet.ts에서 import

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

const MealHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

interface DietLogModalProps {
  onSuccess?: () => void;
}

const DietLogModal: React.FC<DietLogModalProps> = ({ onSuccess }) => {
  const {
    isModalOpen,
    closeModal,
    selectedDate,
    addDietLog,
    editingDietLog,
    setEditingDietLog,
    deleteDietLog,
    updateDietLog,
    addMealToDietLog,
    addFoodToMeal,
    deleteMeal,
    deleteFood,
  } = useDietStore();

  // 로컬 상태 - 각 식사별로 음식 목록 관리
  const [breakfastFoods, setBreakfastFoods] = useState<SelectedFood[]>([]);
  const [lunchFoods, setLunchFoods] = useState<SelectedFood[]>([]);
  const [dinnerFoods, setDinnerFoods] = useState<SelectedFood[]>([]);
  const [currentMealType, setCurrentMealType] = useState<MealType>("breakfast");

  const getFoodCalories = (foodName: string): number => {
    const food = foodData.find((item) => item.foodName === foodName);
    return food ? food.calories : 0;
  };

  // 수정 모드일 때 기존 데이터 로드, 새로 작성할 때는 초기화
  React.useEffect(() => {
    if (editingDietLog) {
      // 기존 식단일지 데이터를 로컬 상태로 변환

      const convertToSelectedFoods = (foods: any[]): SelectedFood[] => {
        return foods.map((food, index) => {
          const calories = getFoodCalories(food.food_name);
          const amount = food.food_amount || 0;
          return {
            uniqueId: index,
            foodId: food._id,
            foodName: food.food_name,
            calories: calories,
            amount: amount,
            total_calories: Math.round((calories * amount) / 100),
            mealId: food.mealId, // Store에서 추가한 mealId 사용
          };
        });
      };

      setBreakfastFoods(convertToSelectedFoods(editingDietLog.breakfast));
      setLunchFoods(convertToSelectedFoods(editingDietLog.lunch));
      setDinnerFoods(convertToSelectedFoods(editingDietLog.dinner));
    } else {
      // 새로 작성할 때는 빈 상태로 초기화
      setBreakfastFoods([]);
      setLunchFoods([]);
      setDinnerFoods([]);
    }
  }, [editingDietLog]);

  // selectedDate가 변경될 때 폼 데이터 초기화 (새로 작성할 때만)
  React.useEffect(() => {
    // 모달이 열려있고 수정 모드가 아닐 때만 초기화
    if (isModalOpen && !editingDietLog) {
      setBreakfastFoods([]);
      setLunchFoods([]);
      setDinnerFoods([]);
      setCurrentMealType("breakfast");
    }
  }, [selectedDate, isModalOpen, editingDietLog]);

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
      uniqueId: Date.now() + Math.random(), // 고유 ID 생성
      ...food,
      amount: 100, // 기본 섭취량 100g
      total_calories: calculateTotalCalories(food.calories, 100),
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

  // 음식 제거 핸들러 - uniqueId 기준으로 변경
  const handleRemoveFood = (uniqueId: number, mealType: MealType) => {
    switch (mealType) {
      case "breakfast":
        setBreakfastFoods((prev) =>
          prev.filter((food) => food.uniqueId !== uniqueId)
        );
        break;
      case "lunch":
        setLunchFoods((prev) =>
          prev.filter((food) => food.uniqueId !== uniqueId)
        );
        break;
      case "dinner":
        setDinnerFoods((prev) =>
          prev.filter((food) => food.uniqueId !== uniqueId)
        );
        break;
    }
  };

  // 섭취량 변경 핸들러 - uniqueId 기준으로 변경
  const handleAmountChange = (
    uniqueId: number,
    mealType: MealType,
    newAmount: number
  ) => {
    const updateFood = (foods: SelectedFood[]) =>
      foods.map((food) =>
        food.uniqueId === uniqueId
          ? {
              ...food,
              amount: newAmount,
              total_calories: calculateTotalCalories(food.calories, newAmount),
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
  const handleSave = async () => {
    try {
      // 로컬 시간 기준으로 날짜를 YYYY-MM-DD 형식으로 변환
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      // API에 전달할 데이터 형식으로 변환
      const logData: DietLogData = {
        date: dateString,
        breakfast: breakfastFoods.map((food) => ({
          foodId: food.foodId,
          foodName: food.foodName,
          calories: food.calories,
          amount: food.amount,
          total_calories: food.total_calories,
        })),
        lunch: lunchFoods.map((food) => ({
          foodId: food.foodId,
          foodName: food.foodName,
          calories: food.calories,
          amount: food.amount,
          total_calories: food.total_calories,
        })),
        dinner: dinnerFoods.map((food) => ({
          foodId: food.foodId,
          foodName: food.foodName,
          calories: food.calories,
          amount: food.amount,
          total_calories: food.total_calories,
        })),
        total_calories: getTotalCalories(),
      };

      console.log("저장할 데이터:", logData);

      // 스토어의 addDietLog 액션 호출
      await addDietLog(logData);

      // 저장 성공 후 모달 닫기
      closeModal();

      // 성공 시 콜백 호출
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("식단 일지 저장 실패:", error);
      // 에러 처리는 스토어에서 이미 처리되므로 여기서는 로그만 출력
      // 필요시 사용자에게 알림을 표시할 수 있음
      alert("식단 일지 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 수정 핸들러 - 기존 식사 수정과 새 식사 추가를 구분하여 처리
  const handleUpdate = async () => {
    try {
      if (!editingDietLog) {
        throw new Error("수정할 식단일지가 없습니다.");
      }

      // 기존 식사가 있는지 확인하는 함수
      const hasExistingMeal = (mealType: string) => {
        const existingMeal = editingDietLog[
          mealType as keyof typeof editingDietLog
        ] as any[];
        return existingMeal && existingMeal.length > 0;
      };

      // 기존 식사 수정 데이터 생성
      const createMealUpdate = (
        foods: SelectedFood[],
        mealType: string
      ): MealUpdateData | null => {
        if (foods.length === 0) return null;

        // 같은 mealId를 가진 foods들을 그룹화
        const mealId = foods[0]?.mealId;
        if (!mealId) return null;

        const foodUpdates: FoodUpdateData[] = foods.map((food) => ({
          _id: food.foodId, // Food의 _id
          food_name: food.foodName,
          food_amount: food.amount,
        }));

        return {
          _id: mealId, // Meal의 _id
          meal_type: mealType,
          foods: foodUpdates,
        };
      };

      // 새 식사 추가 데이터 생성
      const createNewMealData = (foods: SelectedFood[], mealType: string) => {
        if (foods.length === 0) return null;
        return foods.map((food) => ({
          food_name: food.foodName,
          food_amount: food.amount,
        }));
      };

      const meals: MealUpdateData[] = [];
      const newMeals: { [key: string]: any[] } = {};

      // 각 식사별로 처리
      const processMeal = async (foods: SelectedFood[], mealType: string) => {
        if (foods.length === 0) return;

        if (hasExistingMeal(mealType)) {
          // 기존 식사가 있으면 해당 식사에 음식 추가
          const existingMeal = editingDietLog[
            mealType as keyof typeof editingDietLog
          ] as any[];
          const mealId = existingMeal[0]?.mealId;

          if (mealId) {
            // 새로 추가된 음식들만 필터링 (기존 음식은 제외)
            const newFoods = foods.filter(
              (food) => !food.mealId || food.mealId !== mealId
            );

            // 기존 음식들 필터링 (양이 변경된 음식들)
            const existingFoods = foods.filter(
              (food) => food.mealId && food.mealId === mealId
            );

            // 새로 추가된 음식이 있으면 addFoodToMealApi 사용
            if (newFoods.length > 0) {
              const newFoodData = newFoods.map((food) => ({
                food_name: food.foodName,
                food_amount: food.amount,
              }));

              console.log(`기존 ${mealType} 식사에 음식 추가:`, {
                dietLogId: editingDietLog._id,
                mealId,
                newFoodData,
                total_calories: getTotalCalories(),
              });

              await addFoodToMeal(
                editingDietLog._id,
                mealId,
                newFoodData,
                getTotalCalories()
              );
            }

            // 기존 음식의 양 수정이 있으면 updateDietLogApi 사용
            if (existingFoods.length > 0) {
              const mealUpdate = createMealUpdate(existingFoods, mealType);
              if (mealUpdate) meals.push(mealUpdate);
            }
          }
        } else {
          // 기존 식사가 없으면 새로 추가
          const newMealData = createNewMealData(foods, mealType);
          if (newMealData) newMeals[mealType] = newMealData;
        }
      };

      await processMeal(breakfastFoods, "breakfast");
      await processMeal(lunchFoods, "lunch");
      await processMeal(dinnerFoods, "dinner");

      // 기존 식사 수정이 있는 경우
      if (meals.length > 0) {
        const updateData: DietUpdateData = {
          total_calories: getTotalCalories(),
          feedback: "",
          meals: meals,
        };

        console.log("기존 식사 수정 데이터:", updateData);
        await updateDietLog(editingDietLog._id, updateData);
      }

      // 새 식사 추가가 있는 경우
      for (const [mealType, foods] of Object.entries(newMeals)) {
        const newMealTotalCalories = foods.reduce((sum, food) => {
          const calories = getFoodCalories(food.food_name);
          return sum + Math.round((calories * food.food_amount) / 100);
        }, 0);

        console.log(`새 ${mealType} 식사 추가:`, {
          mealType,
          foods,
          newMealTotalCalories,
        });

        await addMealToDietLog(
          editingDietLog._id,
          mealType,
          foods,
          editingDietLog.total_calories + newMealTotalCalories
        );
      }

      // 모든 API 호출이 완료된 후 editingDietLog를 null로 설정
      setEditingDietLog(null);
      closeModal();

      // 성공 시 콜백 호출
      if (onSuccess) {
        onSuccess();
      }
      console.log("식단일지 수정/추가 성공");
    } catch (error) {
      console.error("식단일지 수정/추가 실패:", error);
      alert("식단일지 수정/추가에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 삭제 핸들러
  const handleDelete = async (dietLogId: string) => {
    if (window.confirm("정말로 이 식단일지를 삭제하시겠습니까?")) {
      try {
        await deleteDietLog(dietLogId);
        closeModal();

        // 성공 시 콜백 호출
        if (onSuccess) {
          onSuccess();
        }
        alert("식단일지가 삭제되었습니다.");
      } catch (error) {
        console.error("식단일지 삭제 실패:", error);
        alert("식단일지 삭제에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 식사 삭제 핸들러
  const handleDeleteMeal = async (
    dietLogId: string,
    mealId: string,
    mealType: string
  ) => {
    if (window.confirm(`정말로 ${mealType} 식사를 삭제하시겠습니까?`)) {
      try {
        await deleteMeal(dietLogId, mealId);

        // API 성공 후 로컬 상태에서도 해당 mealId를 가진 음식들 제거 (모달창 즉시 반영)
        setBreakfastFoods((prev) =>
          prev.filter((food) => food.mealId !== mealId)
        );
        setLunchFoods((prev) => prev.filter((food) => food.mealId !== mealId));
        setDinnerFoods((prev) => prev.filter((food) => food.mealId !== mealId));

        // 성공 시 콜백 호출 (페이지 전체 새로고침)
        if (onSuccess) {
          onSuccess();
        }
        alert("식사가 삭제되었습니다.");
      } catch (error) {
        console.error("식사 삭제 실패:", error);
        alert("식사 삭제에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 음식 삭제 핸들러
  const handleDeleteFood = async (
    dietLogId: string,
    mealId: string,
    foodId: string,
    foodName: string
  ) => {
    if (window.confirm(`정말로 "${foodName}"을(를) 삭제하시겠습니까?`)) {
      try {
        await deleteFood(dietLogId, mealId, foodId);

        // API 성공 후 로컬 상태에서도 해당 음식 제거 (모달창 즉시 반영)
        setBreakfastFoods((prev) =>
          prev.filter((food) => food.foodId !== foodId)
        );
        setLunchFoods((prev) => prev.filter((food) => food.foodId !== foodId));
        setDinnerFoods((prev) => prev.filter((food) => food.foodId !== foodId));

        // 성공 시 콜백 호출 (페이지 전체 새로고침)
        if (onSuccess) {
          onSuccess();
        }
        alert("음식이 삭제되었습니다.");
      } catch (error) {
        console.error("음식 삭제 실패:", error);
        alert("음식 삭제에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    // 상태 초기화
    setBreakfastFoods([]);
    setLunchFoods([]);
    setDinnerFoods([]);
    setCurrentMealType("breakfast");
    setEditingDietLog(null); // 수정 모드 초기화
    closeModal();
  };

  // 각 식사별 총 칼로리 계산
  const getMealTotalCalories = (foods: SelectedFood[]): number => {
    return foods.reduce((total, food) => total + food.total_calories, 0);
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
    const total_calories = foods.reduce(
      (sum, food) => sum + food.total_calories,
      0
    );

    // 기존 식사가 있는지 확인하고 mealId 추출
    const hasExistingMeal =
      editingDietLog &&
      editingDietLog[mealType as keyof typeof editingDietLog] &&
      (editingDietLog[mealType as keyof typeof editingDietLog] as any[])
        .length > 0;
    const mealId = hasExistingMeal
      ? (editingDietLog[mealType as keyof typeof editingDietLog] as any[])[0]
          ?.mealId
      : null;

    return (
      <MealSection key={mealType}>
        <MealHeader>
          <MealTypeLabel>{mealName}</MealTypeLabel>
          {hasExistingMeal && mealId && (
            <Button
              variant="danger"
              size="small"
              onClick={() =>
                handleDeleteMeal(editingDietLog._id, mealId, mealName)
              }
            >
              삭제
            </Button>
          )}
        </MealHeader>

        <MealFoodsList>
          {foods.length > 0 ? (
            foods.map((food) => (
              <MealFoodItem key={food.uniqueId}>
                {" "}
                {/* uniqueId로 변경 */}
                <MealFoodInfo>
                  <MealFoodName>{food.foodName}</MealFoodName>
                  <MealFoodCalories>
                    {food.calories} kcal/100g × {food.amount}g ={" "}
                    {food.total_calories} kcal
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
                        food.uniqueId, // uniqueId로 변경
                        mealType,
                        Number(e.target.value)
                      )
                    }
                    min="1"
                    step="1"
                  />
                  <AmountLabel>g</AmountLabel>
                  <RemoveButton
                    onClick={() => {
                      if (editingDietLog && mealId) {
                        // 수정 모드: API를 통해 삭제
                        handleDeleteFood(
                          editingDietLog._id,
                          mealId,
                          food.foodId,
                          food.foodName
                        );
                      } else {
                        // 새로 작성 모드: 로컬 상태에서만 삭제
                        handleRemoveFood(food.uniqueId, mealType);
                      }
                    }}
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
        {total_calories > 0 && <MealTotal>총 {total_calories} kcal</MealTotal>}
      </MealSection>
    );
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleClose}
      title={editingDietLog ? "식단 일지 수정" : "식단 일지 작성"}
    >
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            {editingDietLog ? "식단 일지 수정" : "식단 일지 작성"}
          </ModalTitle>
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
          {editingDietLog && (
            <Button
              variant="danger"
              onClick={() => handleDelete(editingDietLog._id)}
            >
              삭제
            </Button>
          )}
          <Button
            variant="primary"
            onClick={editingDietLog ? handleUpdate : handleSave}
          >
            {editingDietLog ? "수정" : "생성"}
          </Button>
        </ButtonGroup>
      </ModalContent>
    </Modal>
  );
};

export default DietLogModal;

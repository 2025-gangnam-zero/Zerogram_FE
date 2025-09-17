import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  MealState,
  DietLogResponse,
  DietLogData,
  DietUpdateData,
} from "../types/diet";
import {
  getDietLogsByMonthApi,
  createDietLogApi,
  updateDietLogApi,
  addMealToDietLogApi,
  addFoodToMealApi,
  deleteMealApi,
  deleteDietLogApi,
  deleteFoodApi,
} from "../api/diet";

interface DietStoreState {
  // 현재 선택된 날짜
  selectedDate: Date;

  // 선택된 날짜의 식단 기록
  logs: MealState[];

  // 모달 열림/닫힘 상태
  isModalOpen: boolean;

  // 월별 기록 데이터
  monthlyLogs: DietLogResponse[];

  // 현재 표시 중인 년/월
  currentYear: number;
  currentMonth: number;

  // 로딩 및 에러 상태
  isLoading: boolean;
  error: string | null;

  // 수정할 식단일지 정보
  editingDietLog: DietLogResponse | null;
}

interface DietStoreActions {
  // 선택된 날짜 변경
  setSelectedDate: (date: Date) => void;

  // 모달 열기
  openModal: () => void;

  // 모달 닫기
  closeModal: () => void;

  // logs 상태 업데이트
  setLogs: (logs: MealState[]) => void;

  // monthlyLogs 상태 업데이트
  setMonthlyLogs: (logs: DietLogResponse[]) => void;

  // 월별 데이터 조회
  getMonthlyLogs: (year: number, month: number) => Promise<void>;

  // 식단 일지 추가
  addDietLog: (logData: DietLogData) => Promise<void>;

  // 에러 초기화
  clearError: () => void;

  // WorkoutLogPage와 동일한 방식으로 추가
  setCurrentMonth: (year: number, month: number) => Promise<void>;
  getDietLogByDate: (date: Date) => DietLogResponse | null;

  // 수정할 식단일지 설정
  setEditingDietLog: (dietLog: DietLogResponse | null) => void;

  // 식단일지 삭제
  deleteDietLog: (dietLogId: string) => Promise<void>;

  updateDietLog: (
    dietLogId: string,
    updateData: DietUpdateData
  ) => Promise<void>;

  // 기존 식단일지에 새 식사 추가
  addMealToDietLog: (
    dietLogId: string,
    mealType: string,
    foods: Array<{
      food_name: string;
      food_amount: number;
    }>,
    total_calories: number
  ) => Promise<void>;

  // 기존 식사에 음식 추가
  addFoodToMeal: (
    dietLogId: string,
    mealId: string,
    foods: Array<{
      food_name: string;
      food_amount: number;
    }>,
    total_calories: number
  ) => Promise<void>;

  // 식사 삭제
  deleteMeal: (dietLogId: string, mealId: string) => Promise<void>;

  // 음식 삭제
  deleteFood: (
    dietLogId: string,
    mealId: string,
    foodId: string
  ) => Promise<void>;
}

export const useDietStore = create<DietStoreState & DietStoreActions>()(
  persist(
    (set, get) => ({
      // 초기 상태
      selectedDate: new Date(),
      logs: [],
      isModalOpen: false,
      monthlyLogs: [],
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1,
      isLoading: false,
      error: null,
      editingDietLog: null,

      // 액션들
      setSelectedDate: (date: Date) => {
        set({ selectedDate: date });
      },

      openModal: () => {
        set({ isModalOpen: true });
      },

      closeModal: () => {
        set({ isModalOpen: false });
      },

      setLogs: (logs: MealState[]) => {
        set({ logs });
      },

      setMonthlyLogs: (logs: DietLogResponse[]) => {
        set({ monthlyLogs: logs });
      },

      // 월별 데이터 조회
      getMonthlyLogs: async (year: number, month: number) => {
        const { currentYear, currentMonth } = get();

        // 이미 같은 년/월의 데이터가 있으면 fetch하지 않음
        if (currentYear === year && currentMonth === month) {
          console.log(`${year}년 ${month}월 데이터 있음`);
          return;
        }

        set({
          currentYear: year,
          currentMonth: month,
          isLoading: true,
          error: null,
        });

        try {
          const response = await getDietLogsByMonthApi(year, month);

          // API 응답에서 데이터 추출
          let logsArray: DietLogResponse[] = [];
          if (Array.isArray(response.data)) {
            logsArray = response.data;
          } else if (response.data && typeof response.data === "object") {
            const dataObj = response.data as any;
            if (dataObj.data && Array.isArray(dataObj.data)) {
              logsArray = dataObj.data;
            } else if (Array.isArray(dataObj)) {
              logsArray = dataObj;
            }
          }

          set({
            monthlyLogs: logsArray,
            isLoading: false,
          });

          console.log(
            `${year}년 ${month}월 식단 일지 ${logsArray.length}개 로드됨`
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "식단 일지를 불러올 수 없습니다.";
          set({
            isLoading: false,
            error: errorMessage,
            monthlyLogs: [],
          });
          console.error("월별 식단 일지 로드 실패:", error);
        }
      },

      // 식단 일지 추가
      addDietLog: async (logData: DietLogData) => {
        set({ isLoading: true, error: null });

        try {
          console.log("식단 일지 생성 시작:", logData);
          const response = await createDietLogApi(logData);
          console.log("API 응답:", response);

          // 새로 생성된 일지를 monthlyLogs에 추가 (중복 방지)
          const { monthlyLogs } = get();
          const newLog = response.data;

          // 같은 날짜의 기존 로그가 있는지 확인
          const existingLogIndex = monthlyLogs.findIndex(
            (log) => log.date === newLog.date
          );

          let updatedLogs;
          if (existingLogIndex >= 0) {
            // 기존 로그가 있으면 교체
            updatedLogs = [...monthlyLogs];
            updatedLogs[existingLogIndex] = newLog;
          } else {
            // 기존 로그가 없으면 추가
            updatedLogs = [...monthlyLogs, newLog];
          }

          set({
            monthlyLogs: updatedLogs,
            isLoading: false,
          });

          console.log("식단 일지 생성 성공:", newLog);
          console.log("업데이트된 월별 로그 수:", updatedLogs.length);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "식단 일지 저장에 실패했습니다.";
          set({
            isLoading: false,
            error: errorMessage,
          });
          console.error("식단 일지 생성 실패:", error);
          throw error; // 에러를 다시 throw하여 컴포넌트에서 처리할 수 있도록 함
        }
      },

      // 에러 초기화
      clearError: () => {
        set({ error: null });
      },

      // WorkoutLogPage와 동일한 방식으로 현재 월 설정 및 데이터 로드
      setCurrentMonth: async (year: number, month: number) => {
        const { currentYear, currentMonth, monthlyLogs } = get();

        // 임시로 API 호출 강제 실행 (디버깅용)
        console.log(
          `${year}년 ${month}월 데이터 강제 로드 (${monthlyLogs.length}개)`
        );

        console.log(`${year}년 ${month}월 데이터 로드 시작:`, {
          currentYear,
          currentMonth,
          monthlyLogsCount: monthlyLogs.length,
          requestedYear: year,
          requestedMonth: month,
        });

        set({
          currentYear: year,
          currentMonth: month,
          isLoading: true,
          error: null,
        });

        try {
          console.log(
            `API 호출 시작: getDietLogsByMonthApi(${year}, ${month})`
          );
          const response = await getDietLogsByMonthApi(year, month);
          console.log(`API 호출 완료:`, response);
          console.log(
            `API 응답 데이터 상세:`,
            JSON.stringify(response, null, 2)
          );

          // API 응답에서 데이터 추출 및 변환
          let logsArray: DietLogResponse[] = [];
          console.log("API 응답 데이터 타입:", typeof response.data);
          console.log("API 응답 데이터 구조:", response.data);

          if (
            response.data &&
            (response.data as any).diets &&
            Array.isArray((response.data as any).diets)
          ) {
            // 백엔드 응답을 프론트엔드 형태로 변환
            logsArray = (response.data as any).diets.map((diet: any) => {
              // meals를 meal_type별로 그룹화
              const mealsByType: { [key: string]: any[] } = {
                breakfast: [],
                lunch: [],
                dinner: [],
                snack: [],
              };

              diet.meals.forEach((meal: any) => {
                if (mealsByType[meal.meal_type]) {
                  // foods 배열에 mealId 정보 추가
                  const foodsWithMealId = (meal.foods || []).map(
                    (food: any) => ({
                      ...food,
                      mealId: meal._id, // Meal의 _id를 food에 추가
                    })
                  );
                  mealsByType[meal.meal_type] = foodsWithMealId;
                }
              });

              return {
                _id: diet._id,
                date: diet.date,
                breakfast: mealsByType.breakfast,
                lunch: mealsByType.lunch,
                dinner: mealsByType.dinner,
                snack: mealsByType.snack,
                total_calories: diet.total_calories || 0,
                feedback: diet.feedback || "",
                createdAt: diet.createdAt,
                updatedAt: diet.updatedAt,
              };
            });

            console.log("변환된 데이터:", logsArray);
          } else {
            console.log("예상하지 못한 데이터 구조:", response.data);
          }

          // null이나 undefined 값 제거
          const filteredLogs = logsArray.filter((log) => log != null);

          set({
            monthlyLogs: filteredLogs,
            isLoading: false,
          });

          console.log(
            `${year}년 ${month}월 식단 일지 ${filteredLogs.length}개 로드됨`
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "식단 일지를 불러올 수 없습니다.";
          set({
            isLoading: false,
            error: errorMessage,
            monthlyLogs: [],
          });
          console.error("월별 식단 일지 로드 실패:", error);
        }
      },

      // 특정 날짜의 식단일지 필터링해서 반환 (WorkoutLogPage와 동일한 방식)
      getDietLogByDate: (date: Date) => {
        const { monthlyLogs } = get();

        // monthlyLogs가 없거나 비어있으면 null 반환
        if (!monthlyLogs || monthlyLogs.length === 0) {
          return null;
        }

        // 로컬 시간 기준으로 날짜 문자열 생성
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const targetDate = `${year}-${month}-${day}`;

        return (
          monthlyLogs.find((log) => log && log.date === targetDate) || null
        );
      },

      // 수정할 식단일지 설정
      setEditingDietLog: (dietLog: DietLogResponse | null) => {
        set({ editingDietLog: dietLog });
      },

      // 식단일지 삭제
      deleteDietLog: async (dietLogId: string) => {
        set({ isLoading: true, error: null });

        try {
          console.log("식단일지 삭제 시작:", dietLogId);

          // 1. API 호출
          await deleteDietLogApi(dietLogId);

          // 2. monthlyLogs에서 해당 식단일지 제거
          const { monthlyLogs } = get();
          const updatedLogs = monthlyLogs.filter(
            (log) => log._id !== dietLogId
          );

          set({
            monthlyLogs: updatedLogs,
            isLoading: false,
            editingDietLog: null,
          });

          console.log("식단일지 삭제 성공");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "식단일지 삭제에 실패했습니다.";
          set({
            isLoading: false,
            error: errorMessage,
          });
          console.error("식단일지 삭제 실패:", error);
          throw error;
        }
      },
      updateDietLog: async (dietLogId: string, updateData: DietUpdateData) => {
        set({ isLoading: true, error: null });

        try {
          // 1. API 호출
          const response = await updateDietLogApi(dietLogId, updateData);

          // 2. monthlyLogs에서 해당 항목 찾아서 교체
          const { monthlyLogs } = get();
          const updatedLogs = monthlyLogs.map((log) =>
            log._id === dietLogId
              ? response.data // API 응답으로 교체
              : log
          );

          set({
            monthlyLogs: updatedLogs,
            isLoading: false,
            // editingDietLog는 null로 설정하지 않음 (다른 API 호출이 있을 수 있음)
          });

          console.log("식단일지 수정 성공");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "식단일지 수정에 실패했습니다.";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // 기존 식단일지에 새 식사 추가
      addMealToDietLog: async (
        dietLogId: string,
        mealType: string,
        foods: Array<{
          food_name: string;
          food_amount: number;
        }>,
        total_calories: number
      ) => {
        set({ isLoading: true, error: null });

        try {
          console.log("새 식사 추가 시작:", {
            dietLogId,
            mealType,
            foods,
            total_calories,
          });

          // 1. API 호출
          const response = await addMealToDietLogApi(
            dietLogId,
            mealType,
            foods,
            total_calories
          );

          // 2. monthlyLogs에서 해당 항목 찾아서 교체
          const { monthlyLogs } = get();
          const updatedLogs = monthlyLogs.map((log) =>
            log._id === dietLogId
              ? response.data // API 응답으로 교체
              : log
          );

          set({
            monthlyLogs: updatedLogs,
            isLoading: false,
            // editingDietLog는 null로 설정하지 않음 (다른 API 호출이 있을 수 있음)
          });

          console.log("새 식사 추가 성공");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "새 식사 추가에 실패했습니다.";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // 기존 식사에 음식 추가
      addFoodToMeal: async (
        dietLogId: string,
        mealId: string,
        foods: Array<{
          food_name: string;
          food_amount: number;
        }>,
        total_calories: number
      ) => {
        set({ isLoading: true, error: null });

        try {
          console.log("음식 추가 시작:", {
            dietLogId,
            mealId,
            foods,
            total_calories,
          });

          // 1. API 호출
          const response = await addFoodToMealApi(
            dietLogId,
            mealId,
            foods,
            total_calories
          );

          // 2. monthlyLogs에서 해당 항목 찾아서 교체
          const { monthlyLogs } = get();
          const updatedLogs = monthlyLogs.map((log) =>
            log._id === dietLogId
              ? response.data // API 응답으로 교체
              : log
          );

          set({
            monthlyLogs: updatedLogs,
            isLoading: false,
            // editingDietLog는 null로 설정하지 않음 (다른 API 호출이 있을 수 있음)
          });

          console.log("음식 추가 성공");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "음식 추가에 실패했습니다.";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // 식사 삭제
      deleteMeal: async (dietLogId: string, mealId: string) => {
        set({ isLoading: true, error: null });

        try {
          console.log("식사 삭제 시작:", {
            dietLogId,
            mealId,
          });

          // 1. API 호출
          const response = await deleteMealApi(dietLogId, mealId);

          // 2. monthlyLogs에서 해당 항목 찾아서 교체
          const { monthlyLogs } = get();
          const updatedLogs = monthlyLogs.map((log) =>
            log._id === dietLogId
              ? response.data // API 응답으로 교체
              : log
          );

          set({
            monthlyLogs: updatedLogs,
            isLoading: false,
          });

          console.log("식사 삭제 성공");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "식사 삭제에 실패했습니다.";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // 음식 삭제
      deleteFood: async (dietLogId: string, mealId: string, foodId: string) => {
        set({ isLoading: true, error: null });

        try {
          console.log("음식 삭제 시작:", {
            dietLogId,
            mealId,
            foodId,
          });

          // 1. API 호출
          const response = await deleteFoodApi(dietLogId, mealId, foodId);

          // 2. monthlyLogs에서 해당 항목 찾아서 교체
          const { monthlyLogs } = get();
          const updatedLogs = monthlyLogs.map((log) =>
            log._id === dietLogId
              ? response.data // API 응답으로 교체
              : log
          );

          set({
            monthlyLogs: updatedLogs,
            isLoading: false,
          });

          console.log("음식 삭제 성공");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "음식 삭제에 실패했습니다.";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },
    }),
    {
      name: "diet-store", // localStorage 키 이름
      partialize: (state) => ({
        // 저장할 상태만 선택 (함수는 제외)
        selectedDate: state.selectedDate.toISOString(), // Date를 문자열로 변환
        monthlyLogs: state.monthlyLogs,
        currentYear: state.currentYear,
        currentMonth: state.currentMonth,
      }),
      onRehydrateStorage: () => (state) => {
        // 복원 시 selectedDate를 Date 객체로 변환
        if (state && typeof state.selectedDate === "string") {
          state.selectedDate = new Date(state.selectedDate);
        }

        console.log("dietStore 데이터 복원:", {
          selectedDate: state?.selectedDate,
          monthlyLogs: state?.monthlyLogs,
          monthlyLogsCount: state?.monthlyLogs?.length || 0,
          currentYear: state?.currentYear,
          currentMonth: state?.currentMonth,
        });
      },
    }
  )
);

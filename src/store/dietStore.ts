import { create } from "zustand";
import { MealState } from "../types";
import {
  fetchDietLogsByMonth,
  createDietLog,
  DietLogData,
  DietLogResponse,
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
}

export const useDietStore = create<DietStoreState & DietStoreActions>(
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
        console.log(`${year}년 ${month}월 데이터가 이미 있음`);
        return;
      }

      set({
        currentYear: year,
        currentMonth: month,
        isLoading: true,
        error: null,
      });

      try {
        const response = await fetchDietLogsByMonth(year, month);

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
        const response = await createDietLog(logData);
        console.log("API 응답:", response);

        // 새로 생성된 일지를 monthlyLogs에 추가
        const { monthlyLogs } = get();
        const newLog = response.data;

        set({
          monthlyLogs: [...monthlyLogs, newLog],
          isLoading: false,
        });

        console.log("식단 일지 생성 성공:", newLog);
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
  })
);

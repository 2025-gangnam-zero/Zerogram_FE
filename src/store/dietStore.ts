import { create } from "zustand";
import { DietState, MealState } from "../types";

interface DietStoreState {
  // 현재 선택된 날짜
  selectedDate: Date;

  // 선택된 날짜의 식단 기록
  logs: MealState[];

  // 모달 열림/닫힘 상태
  isModalOpen: boolean;

  // 월별 기록 데이터
  monthlyLogs: DietState[];
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
  setMonthlyLogs: (logs: DietState[]) => void;
}

export const useDietStore = create<DietStoreState & DietStoreActions>(
  (set) => ({
    // 초기 상태
    selectedDate: new Date(),
    logs: [],
    isModalOpen: false,
    monthlyLogs: [],

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

    setMonthlyLogs: (logs: DietState[]) => {
      set({ monthlyLogs: logs });
    },
  })
);

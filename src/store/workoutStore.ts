import { create } from "zustand";
import { WorkoutStatePopulated } from "../types";
import { getWorkoutsByMonthApi } from "../api/workout";

// 날짜를 로컬 시간대 기준 YYYY-MM-DD 형식으로 변환하는 헬퍼 함수 (개선된 버전)
const formatDateToLocal = (date: Date): string => {
  // 시간대 오프셋을 고려하여 로컬 날짜 계산
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[0];
};

// 더 안전한 날짜 비교를 위한 함수
const isSameDate = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// 날짜를 YYYY-MM-DD 형식으로 변환하는 헬퍼 함수
// const formatDateForAPI = (date: Date): string => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

interface WorkoutStoreState {
  // 현재 선택된 년/월
  currentYear: number;
  currentMonth: number;

  // 현재 월의 모든 운동일지 데이터
  workouts: WorkoutStatePopulated[];

  // 로딩 및 에러 상태
  isLoading: boolean;
  error: string | null;

  // 마지막으로 데이터를 가져온 년/월 (캐시 확인용)
  lastFetchedYear: number | null;
  lastFetchedMonth: number | null;
}

interface WorkoutStoreActions {
  // 현재 년/월 설정 및 데이터 fetch
  setCurrentMonth: (year: number, month: number) => Promise<void>;

  // 특정 날짜의 운동일지만 필터링해서 반환
  getWorkoutsByDate: (date: Date) => WorkoutStatePopulated[];

  // ID로 개별 운동일지 찾기
  getWorkoutById: (workoutId: string) => WorkoutStatePopulated | null;

  // 수동으로 데이터 새로고침
  refreshWorkouts: () => Promise<void>;

  // 운동일지 추가 후 store 업데이트
  addWorkoutToStore: (workout: WorkoutStatePopulated) => void;

  // 운동일지 수정 후 store 업데이트
  updateWorkoutInStore: (
    workoutId: string,
    updatedWorkout: WorkoutStatePopulated
  ) => void;

  // 운동일지 삭제 후 store 업데이트
  removeWorkoutFromStore: (workoutId: string) => void;

  // 에러 초기화
  clearError: () => void;
}

export const useWorkoutStore = create<WorkoutStoreState & WorkoutStoreActions>(
  (set, get) => ({
    // 초기 상태
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    workouts: [],
    isLoading: false,
    error: null,
    lastFetchedYear: null,
    lastFetchedMonth: null,

    // 현재 년/월 설정 및 데이터 fetch
    setCurrentMonth: async (year: number, month: number) => {
      const { lastFetchedYear, lastFetchedMonth } = get();

      // 이미 같은 년/월의 데이터가 있으면 fetch하지 않음
      if (lastFetchedYear === year && lastFetchedMonth === month) {
        console.log(`${year}년 ${month}월 데이터가 이미 있음`);
        set({ currentYear: year, currentMonth: month });
        return;
      }

      set({
        currentYear: year,
        currentMonth: month,
        isLoading: true,
        error: null,
      });

      try {
        const response = await getWorkoutsByMonthApi(year, month);

        // 응답 데이터 구조 확인 및 정규화
        let workoutsArray: WorkoutStatePopulated[] = [];

        if (Array.isArray(response.data)) {
          workoutsArray = response.data;
        } else if (response.data && typeof response.data === "object") {
          const dataObj = response.data as any;

          if (dataObj.data && Array.isArray(dataObj.data.workouts)) {
            workoutsArray = dataObj.data.workouts;
          } else if (Array.isArray(dataObj.workouts)) {
            workoutsArray = dataObj.workouts;
          } else if (Array.isArray(dataObj.data)) {
            workoutsArray = dataObj.data;
          }
        }

        set({
          workouts: workoutsArray,
          isLoading: false,
          lastFetchedYear: year,
          lastFetchedMonth: month,
        });

        console.log(
          `${year}년 ${month}월 운동일지 ${workoutsArray.length}개 로드됨`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "운동일지를 불러올 수 없습니다.";
        set({
          isLoading: false,
          error: errorMessage,
          workouts: [],
        });
        console.error("월별 운동일지 로드 실패:", error);
      }
    },

    // 특정 날짜의 운동일지 필터링 (date 필드 사용)
    getWorkoutsByDate: (date: Date) => {
      const { workouts } = get();
      const targetDateStr = formatDateToLocal(date);

      console.log(`선택된 날짜: ${targetDateStr}`);

      return workouts.filter((workout) => {
        // 백엔드에서 제공하는 date 필드 사용 (우선)
        if (workout.date) {
          console.log(
            `운동일지 ID: ${workout._id}, 백엔드 date 필드: ${workout.date}, 선택된 날짜: ${targetDateStr}`
          );
          return workout.date === targetDateStr;
        }

        // date 필드가 없으면 createdAt 사용 (백업)
        const workoutCreatedAt = new Date(workout.createdAt);
        const workoutDateStr = formatDateToLocal(workoutCreatedAt);
        const isSameDateResult = isSameDate(date, workoutCreatedAt);

        console.log(`
          운동일지 ID: ${workout._id} (date 필드 없음)
          createdAt 기반 날짜: ${workoutDateStr}
          선택된 날짜: ${targetDateStr}
          매칭 결과: ${workoutDateStr === targetDateStr || isSameDateResult}
        `);

        return workoutDateStr === targetDateStr || isSameDateResult;
      });
    },

    // ID로 개별 운동일지 찾기
    getWorkoutById: (workoutId: string) => {
      const { workouts } = get();
      return workouts.find((w) => w._id === workoutId) || null;
    },

    // 데이터 새로고침
    refreshWorkouts: async () => {
      const { currentYear, currentMonth } = get();

      // 캐시를 무시하고 강제로 새로고침
      set({ lastFetchedYear: null, lastFetchedMonth: null });
      await get().setCurrentMonth(currentYear, currentMonth);
    },

    // 새 운동일지 추가
    addWorkoutToStore: (workout: WorkoutStatePopulated) => {
      const { workouts } = get();
      set({ workouts: [...workouts, workout] });
    },

    // 운동일지 수정
    updateWorkoutInStore: (
      workoutId: string,
      updatedWorkout: WorkoutStatePopulated
    ) => {
      const { workouts } = get();
      set({
        workouts: workouts.map((w) =>
          w._id === workoutId ? updatedWorkout : w
        ),
      });
    },

    // 운동일지 삭제
    removeWorkoutFromStore: (workoutId: string) => {
      const { workouts } = get();
      set({
        workouts: workouts.filter((w) => w._id !== workoutId),
      });
    },

    // 에러 초기화
    clearError: () => {
      set({ error: null });
    },
  })
);

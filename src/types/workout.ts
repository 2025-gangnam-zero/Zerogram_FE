export type WorkoutType = "running" | "fitness";

// 메인 운동 기록
export interface WorkoutState {
  _id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  details: WorkoutDetailType[];
}

// 운동 세부사항
export interface WorkoutDetailType {
  _id: string;
  workoutId: string;
  workout_name: WorkoutType;
  duration: number; // 운동 시간 (분)
  calories: number; // 소모 칼로리
  feedback?: string; // 소감, 감상

  // 피트니스 관련
  body_part?: string; // 부위
  fitness_type?: string; // 종목
  sets?: number; // 세트 수
  reps?: number; // 횟수
  weight?: number; // 무게 (kg)

  // 러닝 관련
  avg_pace?: number; // 평균 페이스 (초/km)
  distance?: number; // 거리 (km)

  createdAt: string;
  updatedAt: string;
}

// 운동일지 생성 요청 데이터
export interface CreateWorkoutRequest {
  details: Omit<
    WorkoutDetailType,
    "_id" | "workoutId" | "createdAt" | "updatedAt"
  >[];
}

// 레거시 호환성을 위한 타입 (기존 컴포넌트에서 사용)
export interface workouts extends WorkoutState {}

// 헬스 운동 입력 폼용 (기존 호환성)
export interface FitnessType {
  body_part: string;
  fitness_type: string;
  sets: number;
  reps: number;
  weight: number;
}

// 러닝 입력 폼용 (기존 호환성)
export interface RunningType {
  avg_pace: string; // 사용자 입력용 (5:30 형식)
  distance: number;
}

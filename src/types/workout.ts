export type WorkoutType = "running" | "fitness";

export interface workouts {
  _id: string;
  workout_name: WorkoutType;
  duration: string; // 운동 시간
  calories: string; // 칼로리
  feedback: string; // 소감, 추가사항
  createdAt: string;
  updatedAt: string;

  // 러닝
  running?: RunningType;

  // 피트니스
  fitness?: FitnessType[];
}

export interface FitnessType {
  body_part: string;
  fitness_type: string;
  sets: number; // 세트 수
  reps: number; // 횟수
  weight: number; // 무게
}

export interface RunningType {
  avg_pace: string; // 평균 페이스
  distance: string; // 거리
}

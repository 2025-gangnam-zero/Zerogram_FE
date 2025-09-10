export type WorkoutType = "running" | "fitness";

export interface WorkoutState {
  // 공통
  _id: string;
  userId: string;
  createdAt: Date; // 생성 시각
  updatedAt: Date; // 수정 시각
  details: string[];
  date?: string; // 사용자가 선택한 날짜 (YYYY-MM-DD 형식)
}

export interface WorkoutDetailState {
  _id: string;
  workoutId: string;
  workout_name: WorkoutType;
  duration: number; // 운동 시간
  calories: number; // 소모 칼로리
  feedback?: string; // 소감, 감상

  // 피트니스
  fitnessDetails: string[];

  // 러닝
  avg_pace?: number; // 평균 페이스
  distance?: number; // 거리
  createdAt: Date;
  updatedAt: Date;
}

export interface FitnessDetailState {
  _id: string;
  workoutDetailId: string;
  body_part?: string; // 부위
  fitness_type?: string; // 종목
  sets?: number; // 세트 수
  reps?: number; // 횟수
  weight?: number; // 무게
  createdAt: Date;
  updatedAt: Date;
}

// 운동일지 생성 요청 데이터
export interface CreateWorkoutRequest {
  details: CreateWorkoutDetailRequest[];
}

// 운동 세부사항 생성 요청 데이터
export interface CreateWorkoutDetailRequest {
  workout_name: WorkoutType;
  duration: number; // 운동 시간
  calories: number; // 소모 칼로리
  feedback?: string; // 소감, 감상

  // 러닝 관련 필드
  avg_pace?: number; // 평균 페이스
  distance?: number; // 거리

  // 피트니스 관련 필드 (백엔드에서 FitnessDetailState로 분리 처리)
  fitnessDetails?: CreateFitnessDetailRequest[];
}

// 피트니스 세부사항 생성 요청 데이터
export interface CreateFitnessDetailRequest {
  body_part?: string; // 부위
  fitness_type?: string; // 종목
  sets?: number; // 세트 수
  reps?: number; // 횟수
  weight?: number; // 무게
}

// 레거시 호환성을 위한 타입 (기존 컴포넌트에서 사용)
export interface workouts extends WorkoutState {}

// 기존 컴포넌트와의 호환성을 위한 alias
export type WorkoutDetailType = WorkoutDetailState;

// API 응답에서 populate된 데이터를 위한 인터페이스들
export interface WorkoutDetailPopulated
  extends Omit<WorkoutDetailState, "fitnessDetails"> {
  fitnessDetails: FitnessDetailState[]; // populated fitness details
}

export interface WorkoutStatePopulated extends Omit<WorkoutState, "details"> {
  details: WorkoutDetailPopulated[]; // populated workout details
}

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

// 수정 요청 타입들 추가
export interface UpdateWorkoutRequest {
  date?: string; // 운동일지 날짜 수정
  // 추가적인 운동일지 레벨 필드들이 있다면 여기에 추가
}

export interface UpdateWorkoutDetailRequest {
  workout_name?: WorkoutType;
  duration?: number; // 운동 시간
  calories?: number; // 소모 칼로리
  feedback?: string; // 소감, 감상

  // 러닝 관련 필드
  avg_pace?: number; // 평균 페이스
  distance?: number; // 거리
}

export interface UpdateFitnessDetailRequest {
  body_part?: string; // 부위
  fitness_type?: string; // 종목
  sets?: number; // 세트 수
  reps?: number; // 횟수
  weight?: number; // 무게
}

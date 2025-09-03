// 공통 타입 정의

// 버튼 관련 타입
export type ButtonVariant = "primary" | "secondary" | "outline" | "danger";
export type ButtonSize = "small" | "medium" | "large";

// 입력 필드 관련 타입
export type InputType = "text" | "email" | "password" | "number" | "tel";

// 폼 에러 타입
export interface FormErrors {
  [key: string]: string;
}

// 로딩 상태 타입
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number;
  limit: number;
}

// 정렬 타입
export type SortOrder = "asc" | "desc";

// 필터 타입
export interface FilterParams {
  [key: string]: any;
}

// 검색 타입
export interface SearchParams {
  query: string;
  filters?: FilterParams;
  sort?: {
    field: string;
    order: SortOrder;
  };
  pagination?: PaginationParams;
}

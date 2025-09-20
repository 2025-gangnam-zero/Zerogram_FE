import { ERROR_MESSAGES, HTTP_STATUS } from "../constants";
import { AxiosError } from "axios";

// API 에러 메시지 생성
export const getApiErrorMessage = (error: unknown): string => {
  // Axios 에러인 경우 먼저 처리
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const serverMessage = axiosError.response?.data as any;

    // 서버에서 보낸 에러 메시지가 있다면 사용
    if (serverMessage?.message) {
      return serverMessage.message;
    }

    // HTTP 상태 코드별 에러 메시지
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return ERROR_MESSAGES.API.BAD_REQUEST;
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_MESSAGES.API.UNAUTHORIZED;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.API.NOT_FOUND;
      case HTTP_STATUS.CONFLICT:
        return ERROR_MESSAGES.API.CONFLICT;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ERROR_MESSAGES.API.INTERNAL_SERVER_ERROR;
      default:
        return ERROR_MESSAGES.API.UNKNOWN;
    }
  }

  // 일반 Error인 경우 (이미 처리된 에러 메시지가 있다면 그대로 반환)
  if (error instanceof Error) {
    if (error.message && !error.message.includes("알 수 없는 오류")) {
      return error.message;
    }
  }

  return ERROR_MESSAGES.API.UNKNOWN;
};

// 에러 로깅
export const logError = (context: string, error: unknown): void => {
  // 개발 환경에서만 상세 에러 로깅, 프로덕션에서는 변환된 메시지만 로깅
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}] Error:`, error);
  } else {
    console.error(`[${context}] Error:`, getApiErrorMessage(error));
  }
};

// 에러 알림 표시
export const showErrorAlert = (message: string): void => {
  alert(message);
};

// 성공 알림 표시
export const showSuccessAlert = (message: string): void => {
  alert(message);
};

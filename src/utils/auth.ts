import { AUTH_CONSTANTS } from "../constants";

// 세션 ID 관리
export const getSessionId = (): string | null => {
  return localStorage.getItem(AUTH_CONSTANTS.SESSION_ID_KEY);
};

export const setSessionId = (sessionId: string): void => {
  localStorage.setItem(AUTH_CONSTANTS.SESSION_ID_KEY, sessionId);
};

export const removeSessionId = (): void => {
  localStorage.removeItem(AUTH_CONSTANTS.SESSION_ID_KEY);
};

// 사용자 이름 관리
export const getUserName = (): string | null => {
  return localStorage.getItem(AUTH_CONSTANTS.USER_NAME_KEY);
};

export const setUserName = (userName: string): void => {
  localStorage.setItem(AUTH_CONSTANTS.USER_NAME_KEY, userName);
};

export const removeUserName = (): void => {
  localStorage.removeItem(AUTH_CONSTANTS.USER_NAME_KEY);
};

// 인증 상태 확인
export const isAuthenticated = (): boolean => {
  return !!getSessionId();
};

// 로그아웃 시 모든 인증 정보 제거
export const clearAuthData = (): void => {
  removeSessionId();
  removeUserName();
};

// URL에서 사용자 정보 파라미터 추출
export const extractUserParamsFromURL = (params: URLSearchParams) => {
  return {
    sessionId: params.get("sessionId"),
    userId: params.get("_id"),
    nickname: params.get("nickname"),
    email: params.get("email"),
    profileImage: params.get("profile_image"),
    role: params.get("role"),
  };
};

// URL 디코딩
export const decodeURLParam = (param: string | null): string | null => {
  return param ? decodeURIComponent(param) : null;
};

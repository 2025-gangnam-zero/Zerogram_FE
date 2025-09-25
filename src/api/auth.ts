import axios from "axios";
import { API_CONFIG, AUTH_CONSTANTS } from "../constants";
import { getApiErrorMessage, logError } from "../utils";
import {
  LoginFormData,
  SignupFormData,
  UpdateUserData,
  ApiResponse,
  LoginResponse,
} from "../types";

// axios 인스턴스 생성 및 기본 설정
const authApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// 요청 인터셉터 (요청 전 처리)
authApi.interceptors.request.use(
  (config) => {
    // 세션ID가 있다면 헤더에 추가
    const sessionId = localStorage.getItem(AUTH_CONSTANTS.SESSION_ID_KEY);

    if (sessionId) {
      config.headers["x-session-id"] = sessionId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (응답 후 처리)
authApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 에러 시 세션ID 제거 및 Zustand 스토어 동기화
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_CONSTANTS.SESSION_ID_KEY);
      localStorage.removeItem(AUTH_CONSTANTS.USER_NAME_KEY);

      // 페이지가 로드된 후에만 Zustand 스토어 업데이트
      if (typeof window !== "undefined") {
        // 이벤트를 발생시켜 Zustand 스토어가 업데이트되도록 함
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);

// 회원가입 API 함수
export const signupApi = async (
  userData: Omit<SignupFormData, "confirmPassword">
): Promise<ApiResponse> => {
  try {
    const response = await authApi.post("/api/auth/signup", userData);
    return response.data;
  } catch (error) {
    logError("signupApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 로그인 API 함수
export const loginApi = async (
  credentials: LoginFormData
): Promise<ApiResponse<LoginResponse>> => {
  try {
    const response = await authApi.post("/api/auth/login", credentials);
    return response.data;
  } catch (error) {
    logError("loginApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 로그아웃 API 함수
export const logoutApi = async (): Promise<ApiResponse> => {
  try {
    const response = await authApi.post("/api/auth/logout");
    return response.data;
  } catch (error) {
    logError("logoutApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

export const unsubscribeApi = async (): Promise<ApiResponse> => {
  try {
    const response = await authApi.delete("/api/users/me");
    return response.data;
  } catch (error) {
    logError("unsubscribeApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 사용자 정보 조회 API 함수
export const getUserInfoApi = async (): Promise<ApiResponse<{ user: any }>> => {
  try {
    const response = await authApi.get("/api/users/me");
    return response.data;
  } catch (error) {
    logError("getUserInfoApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 사용자 정보 업데이트 API 함수
export const updateUserInfoApi = async (
  userData: UpdateUserData | FormData
): Promise<ApiResponse> => {
  try {
    const config =
      userData instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};

    const response = await authApi.patch("/api/users/me", userData, config);
    return response.data;
  } catch (error) {
    logError("updateUserInfoApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

// 프로필 사진 초기화 API 함수
export const resetProfileImageApi = async (): Promise<ApiResponse> => {
  try {
    const response = await authApi.delete("/api/users/me/profile-image");
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// 기존 비밀번호 확인 API 함수
export const verifyCurrentPasswordApi = async (
  password: string
): Promise<ApiResponse> => {
  try {
    const response = await authApi.post("/api/auth/verify-password", {
      password,
    });
    return response.data;
  } catch (error) {
    logError("verifyCurrentPasswordApi", error);
    throw new Error(getApiErrorMessage(error));
  }
};

export default authApi;

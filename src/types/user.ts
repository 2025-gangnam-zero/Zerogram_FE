export type GenderType = "m" | "f";
export type RoleType = "USER" | "ADMIN";

// 서버에서 받는 사용자 데이터 타입
export interface User {
  _id: string;
  email: string;
  password?: string;
  profile_img?: string;
  nickname: string;
  gender: GenderType;
  role: RoleType;
  createdAt: string;
  updatedAt: string;
}

// 클라이언트에서 사용하는 사용자 데이터 타입
export interface UserProfile {
  id: string;
  nickname: string;
  email?: string;
  password: string;
  profile_image?: string;
  sessionId: string;
  login_type: string;
}

// 사용자 정보 업데이트용 타입
export interface UpdateUserData {
  nickname?: string;
  password?: string;
  profile_image?: File;
}

// 로그인 폼 데이터 타입
export interface LoginFormData {
  email: string;
  pw: string;
}

// 회원가입 폼 데이터 타입
export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

// 로그인 API 응답 타입
export interface LoginResponse {
  sessionId: string;
  userName?: string;
  nickname?: string;
}

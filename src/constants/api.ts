// API 관련 상수
export const API_CONFIG = {
  // 최종 배포시 로컬 주소 지우고 env와 ec2 주소만 남겨둘 것!
  BASE_URL: process.env.REACT_APP_API_BASE_URL || "",
  //  "http://ec2-15-164-151-28.ap-northeast-2.compute.amazonaws.com",
  //"http://10.10.0.89:4000",
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
  },
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: "/auth/signup",
    LOGIN: "/auth/login",
    OAUTH: "/auth/oauth",
  },
  USERS: {
    ME: "/users/me",
  },
} as const;

export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

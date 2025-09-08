// 인증 관련 상수
export const AUTH_CONSTANTS = {
  SESSION_ID_KEY: "sessionId",
  USER_NAME_KEY: "userName",
  STORAGE_NAME: "auth-storage",
} as const;

export const OAUTH_CONFIG = {
  KAKAO: {
    CLIENT_ID: process.env.REACT_APP_KAKAO_CLIENT_ID,
    REDIRECT_URI: "http://10.10.0.77:4000/auth/oauth",
    // "http://ec2-15-164-151-28.ap-northeast-2.compute.amazonaws.com/auth/oauth",
    AUTH_URL: "https://kauth.kakao.com/oauth/authorize",
    RESPONSE_TYPE: "code",
    STATE: "kakao",
  },
  GOOGLE: {
    CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    REDIRECT_URI: "http://10.10.0.77.nip.io:4000/auth/oauth",
    // "http://ec2-15-164-151-28.ap-northeast-2.compute.amazonaws.com/auth/oauth",
    AUTH_URL: "https://accounts.google.com/o/oauth2/v2/auth",
    RESPONSE_TYPE: "code",
    SCOPE: "openid email profile",
    STATE: "google",
  },
} as const;

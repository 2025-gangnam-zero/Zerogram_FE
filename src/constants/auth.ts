// 인증 관련 상수
export const AUTH_CONSTANTS = {
  SESSION_ID_KEY: "sessionId",
  USER_NAME_KEY: "userName",
  STORAGE_NAME: "auth-storage",
} as const;

export const OAUTH_CONFIG = {
  KAKAO: {
    CLIENT_ID: process.env.REACT_APP_KAKAO_CLIENT_ID,
    REDIRECT_URI:
      "http://ec2-43-201-20-75.ap-northeast-2.compute.amazonaws.com/auth/oauth",
    AUTH_URL: "https://kauth.kakao.com/oauth/authorize",
    RESPONSE_TYPE: "code",
    STATE: "kakao",
  },
  GOOGLE: {
    CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    REDIRECT_URI:
      "http://ec2-43-201-20-75.ap-northeast-2.compute.amazonaws.com/auth/oauth",
    AUTH_URL: "https://accounts.google.com/o/oauth2/v2/auth",
    RESPONSE_TYPE: "code",
    SCOPE: "openid email profile",
    STATE: "google",
  },
} as const;

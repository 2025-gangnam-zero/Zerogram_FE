// 유효성 검사 관련 상수
export const VALIDATION_RULES = {
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: "올바른 이메일 형식을 입력해주세요",
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MESSAGE: "비밀번호는 8자 이상이어야 합니다",
  },
  NICKNAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20,
    MESSAGE: "닉네임은 2-20자 사이여야 합니다",
  },
} as const;

export const ERROR_MESSAGES = {
  REQUIRED: {
    EMAIL: "이메일을 입력해주세요",
    PASSWORD: "비밀번호를 입력해주세요",
    CONFIRM_PASSWORD: "비밀번호 확인을 입력해주세요",
    NAME: "이름을 입력해주세요",
    NICKNAME: "닉네임을 입력해주세요",
  },
  MISMATCH: {
    PASSWORD: "비밀번호가 일치하지 않습니다",
  },
  API: {
    BAD_REQUEST: "잘못된 요청입니다. 입력 정보를 확인해주세요.",
    UNAUTHORIZED: "인증이 필요합니다. 다시 로그인해주세요.",
    FORBIDDEN: "접근 권한이 없습니다.",
    NOT_FOUND: "요청한 정보를 찾을 수 없습니다.",
    CONFLICT: "이미 존재하는 정보입니다.",
    INTERNAL_SERVER_ERROR:
      "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    UNKNOWN: "알 수 없는 오류가 발생했습니다.",
  },
} as const;

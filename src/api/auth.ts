import axios from "axios";

// axios 인스턴스 생성 및 기본 설정
const authApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 (요청 전 처리)
authApi.interceptors.request.use(
  (config) => {
    // 토큰이 있다면 헤더에 추가
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // 에러 처리 (예: 401 에러 시 토큰 제거)
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

// 회원가입 API 함수
export const signupApi = async (userData: {
  email: string;
  password: string;
  name: string;
}) => {
  try {
    const response = await authApi.post("/api/auth/signup", userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 서버에서 보낸 에러 메시지가 있다면 사용
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      // HTTP 상태 코드별 에러 메시지
      switch (error.response?.status) {
        case 400:
          throw new Error("잘못된 요청입니다. 입력 정보를 확인해주세요.");
        case 409:
          throw new Error("이미 존재하는 이메일입니다.");
        case 500:
          throw new Error(
            "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          );
        default:
          throw new Error("회원가입 중 오류가 발생했습니다.");
      }
    }
    throw new Error("알 수 없는 오류가 발생했습니다.");
  }
};

// 로그인 API 함수 (향후 사용을 위해)
export const loginApi = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const response = await authApi.post("/api/auth/login", credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      switch (error.response?.status) {
        case 400:
          throw new Error("이메일과 비밀번호를 확인해주세요.");
        case 401:
          throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.");
        case 500:
          throw new Error(
            "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          );
        default:
          throw new Error("로그인 중 오류가 발생했습니다.");
      }
    }
    throw new Error("알 수 없는 오류가 발생했습니다.");
  }
};

export default authApi;

import axios from "axios";

// axios 인스턴스 생성 및 기본 설정
const authApi = axios.create({
  baseURL: "http://10.10.0.83:4000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 (요청 전 처리)
authApi.interceptors.request.use(
  (config) => {
    // 세션ID가 있다면 헤더에 추가
    const sessionId = localStorage.getItem("sessionId");
    console.log("API 요청 인터셉터 - 세션 ID:", sessionId, "URL:", config.url);
    console.log("현재 localStorage 상태:", {
      sessionId: localStorage.getItem("sessionId"),
      userName: localStorage.getItem("userName"),
    });

    if (sessionId) {
      config.headers["x-session-id"] = sessionId;
      console.log("Authorization 헤더 설정:", `Bearer ${sessionId}`);
    } else {
      console.log("세션 ID가 없어 Authorization 헤더를 설정하지 않음");
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
      localStorage.removeItem("sessionId");
      localStorage.removeItem("userName");

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
export const signupApi = async (userData: {
  email: string;
  password: string;
  name: string;
}) => {
  try {
    const response = await authApi.post("/auth/signup", userData);
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

// 로그인 API 함수
export const loginApi = async (credentials: { email: string; pw: string }) => {
  try {
    const response = await authApi.post("/auth/login", credentials);
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

// 사용자 정보 조회 API 함수
export const getUserInfoApi = async () => {
  try {
    const response = await authApi.get("/users/me");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      switch (error.response?.status) {
        case 401:
          throw new Error("인증이 필요합니다. 다시 로그인해주세요.");
        case 404:
          throw new Error("사용자 정보를 찾을 수 없습니다.");
        case 500:
          throw new Error(
            "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          );
        default:
          throw new Error("사용자 정보 조회 중 오류가 발생했습니다.");
      }
    }
    throw new Error("알 수 없는 오류가 발생했습니다.");
  }
};

export default authApi;

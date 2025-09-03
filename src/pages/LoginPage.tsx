import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import { useAuthStore } from "../store/authStore";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { loginApi } from "../api/auth";

const LoginContainer = styled.div`
  padding: 40px 20px;
  text-align: center;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 30px;
`;

const LoginForm = styled.form`
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ButtonContainer = styled.div`
  margin-top: 12px;
`;

const SocialButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  background: white;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 12px;

  &:hover {
    border-color: #3498db;
    background: #f8f9fa;
  }
`;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchUserInfo } = useUserStore();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    pw: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    pw: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState<{
    sessionId: string;
  } | null>(null);

  const [params] = useSearchParams();
  const sessionId = params.get("sessionId");

  // 로그인 성공 후 동기화 처리
  useEffect(() => {
    if (loginSuccess) {
      const { sessionId } = loginSuccess;

      // 1. 먼저 localStorage에 저장 (API 인터셉터가 사용할 수 있도록)
      localStorage.setItem("sessionId", sessionId);

      // 2. Zustand 스토어에 저장
      login(sessionId);

      // 3. userStore에도 세션 ID 설정 (동기적으로 처리)
      const { setSessionId } = useUserStore.getState();
      setSessionId(sessionId);

      // 4. 동기화 확인
      console.log("Zustand 스토어 동기화 완료:", {
        authStore: useAuthStore.getState().sessionId,
        userStore: useUserStore.getState().sessionId,
        localStorage: localStorage.getItem("sessionId"),
      });

      // 5. 잠시 대기 후 사용자 정보를 API로 가져오기
      const timer = setTimeout(async () => {
        try {
          // 세션 ID가 여전히 유효한지 재확인
          const currentSessionId = localStorage.getItem("sessionId");
          if (currentSessionId !== sessionId) {
            console.warn("세션 ID가 변경됨:", {
              original: sessionId,
              current: currentSessionId,
            });
          }

          console.log("사용자 정보 조회 시도 - 세션 ID:", currentSessionId);
          await fetchUserInfo();
          alert("로그인에 성공했습니다.");
          navigate("/");
        } catch (error) {
          console.error("사용자 정보 조회 실패:", error);
          alert("로그인은 성공했지만 사용자 정보를 가져올 수 없습니다.");
          navigate("/");
        }
      }, 500);

      // 6. loginSuccess 상태 초기화 (useEffect가 한 번만 실행되도록)
      setLoginSuccess(null);

      return () => clearTimeout(timer);
    }
  }, [loginSuccess, login, fetchUserInfo, navigate]);

  // 로그인 이후 sessionId 확인
  useEffect(() => {
    if (!sessionId) return;

    console.log("URL에서 받은 sessionId:", sessionId);

    // URL에서 사용자 정보 파라미터들 추출
    const userId = params.get("_id");
    const nickname = params.get("nickname");
    const email = params.get("email");
    const profileImage = params.get("profile_image");
    const role = params.get("role");

    // 카카오 로그인 후 받은 데이터가 있는지 확인
    if (userId && nickname && email) {
      console.log("카카오 로그인 데이터 처리 중:", {
        sessionId,
        userId,
        nickname: decodeURIComponent(nickname),
        email,
        profileImage: profileImage ? decodeURIComponent(profileImage) : null,
        role,
      });

      // 1. localStorage에 sessionId 저장
      localStorage.setItem("sessionId", sessionId);

      // 2. authStore에 로그인 상태 저장
      login(sessionId);

      // 3. userStore에 사용자 정보 저장
      const { setUser } = useUserStore.getState();
      setUser({
        id: userId,
        nickname: decodeURIComponent(nickname), // URL 디코딩
        email,
        sessionId,
      });

      // 4. 동기화 확인
      console.log("카카오 로그인 데이터 저장 완료:", {
        authStore: useAuthStore.getState().sessionId,
        userStore: useUserStore.getState(),
        localStorage: localStorage.getItem("sessionId"),
      });

      // 5. 홈페이지로 리다이렉션
      navigate("/");
    } else {
      // 일반적인 sessionId만 있는 경우 (기존 로직)
      console.log("일반 sessionId 처리:", sessionId);
    }
  }, [sessionId, params, login, navigate]);

  // 인풋 변경 핸들러
  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  const validateForm = () => {
    const newErrors = { email: "", pw: "" };

    if (!formData.email) {
      newErrors.email = "이메일을 입력하세요";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력하세요";
    }

    if (!formData.pw) {
      newErrors.pw = "비밀번호를 입력하세요";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const data = await loginApi({
        email: formData.email,
        pw: formData.pw,
      });

      // 백엔드 응답에서 세션 ID와 사용자 이름 추출
      const sessionId = data.data?.sessionId;
      const userName = data.data?.userName || data.data?.nickname || "사용자";

      if (sessionId) {
        console.log(
          "로그인 성공 - 세션 ID:",
          sessionId,
          "사용자 이름:",
          userName
        );
        console.log("전체 응답 데이터:", data);
        navigate("/");
        setLoginSuccess({ sessionId });
      } else {
        console.error("로그인 응답에 세션 ID가 없음:", data);
        alert("로그인 정보를 가져올 수 없습니다.");
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`로그인 실패: ${error.message}`);
      } else {
        alert("로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 구글 소셜 로그인
  const handleGoogleSignup = () => {
    // TODO: 구글 OAuth 로그인 구현
    console.log("구글 회원가입");
  };
  // 카카오 소셜 로그인
  const CLIENT_ID = process.env.REACT_APP_KAKAO_CLIENT_ID;
  const REDIRECT_URI = "http://43.201.20.75/auth/oauth"; // Redirect URI를 여기에 입력
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&state=kakao`;

  const handleKakaoSignup = () => {
    window.location.href = KAKAO_AUTH_URL;
    console.log("카카오 회원가입");
  };

  return (
    <LoginContainer>
      <Title>로그인</Title>
      <Subtitle>Zerogram에 로그인하여 서비스를 이용하세요</Subtitle>
      <LoginForm onSubmit={handleSubmit}>
        <Input
          label="이메일"
          type="email"
          placeholder="이메일을 입력하세요"
          value={formData.email}
          onChange={handleInputChange("email")}
          error={errors.email}
          required
        />
        <Input
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={formData.pw}
          onChange={handleInputChange("pw")}
          error={errors.pw}
          required
        />
        <ButtonContainer>
          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? "처리 중..." : "로그인"}
          </Button>
        </ButtonContainer>
        <SocialButton type="button" onClick={handleGoogleSignup}>
          Google 로그인
        </SocialButton>
        <SocialButton type="button" onClick={handleKakaoSignup}>
          카카오 로그인
        </SocialButton>
      </LoginForm>
    </LoginContainer>
  );
};

export default LoginPage;

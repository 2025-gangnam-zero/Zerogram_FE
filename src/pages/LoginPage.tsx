import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import { useAuthStore } from "../store/authStore";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { loginApi } from "../api/auth";
import { OAUTH_CONFIG } from "../constants";
import {
  validateLoginForm,
  hasFormErrors,
  showErrorAlert,
  showSuccessAlert,
  generateGoogleOAuthURL,
  handleGoogleOAuthError,
} from "../utils";
import {
  extractUserParamsFromURL,
  decodeURLParam,
  setSessionId,
} from "../utils";
import { LoginFormData, FormErrors } from "../types";

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
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    pw: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    pw: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState<{
    sessionId: string;
  } | null>(null);

  const [params] = useSearchParams();
  const sessionId = params.get("sessionId");
  const error = params.get("error");
  const state = params.get("state");

  // OAuth 에러 처리
  useEffect(() => {
    if (error) {
      const errorDescription = params.get("error_description");

      if (state === "google") {
        const googleError = handleGoogleOAuthError(
          error,
          errorDescription || undefined
        );
        showErrorAlert(googleError.message);
      } else {
        showErrorAlert(`로그인 오류: ${error}`);
      }

      // URL에서 에러 파라미터 제거
      navigate("/login", { replace: true });
    }
  }, [error, state, params, navigate]);

  // 로그인 성공 후 동기화 처리
  useEffect(() => {
    if (loginSuccess) {
      const { sessionId } = loginSuccess;

      // 1. 먼저 localStorage에 저장 (API 인터셉터가 사용할 수 있도록)
      setSessionId(sessionId);

      // 2. Zustand 스토어에 저장
      login(sessionId);

      // 3. userStore에도 세션 ID 설정 (동기적으로 처리)
      const { setSessionId: setUserSessionId } = useUserStore.getState();
      setUserSessionId(sessionId);

      // 4. 동기화 확인

      // 5. 잠시 대기 후 사용자 정보를 API로 가져오기
      const timer = setTimeout(async () => {
        try {
          await fetchUserInfo();
          showSuccessAlert("로그인에 성공했습니다.");
          navigate("/");
        } catch (error) {
          console.error("사용자 정보 조회 실패:", error);
          showErrorAlert(
            "로그인은 성공했지만 사용자 정보를 가져올 수 없습니다."
          );
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

    // URL에서 사용자 정보 파라미터들 추출
    const userParams = extractUserParamsFromURL(params);
    const { userId, nickname, email, profileImage } = userParams; //role 삭제

    // 카카오 로그인 후 받은 데이터가 있는지 확인
    if (userId && nickname && email) {
      const decodedNickname = decodeURLParam(nickname);
      const decodedProfileImage = decodeURLParam(profileImage);

      // 1. localStorage에 sessionId 저장
      setSessionId(sessionId);

      // 2. authStore에 로그인 상태 저장
      login(sessionId);

      // 3. userStore에 사용자 정보 저장
      const { setUser } = useUserStore.getState();
      setUser({
        id: userId,
        nickname: decodedNickname || "",
        email: email || "",
        password: "",
        login_type: "SOCIAL",
        profile_image: decodedProfileImage || undefined,
        sessionId,
      });

      // 4. 동기화 확인

      // 5. 홈페이지로 리다이렉션
      navigate("/");
    } else {
      // 일반적인 sessionId만 있는 경우 (기존 로직)
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
    const newErrors = validateLoginForm(formData);
    setErrors(newErrors);
    return !hasFormErrors(newErrors);
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
      // const userName = data.data?.userName || data.data?.nickname || "사용자";
      // userName 사용되지 않음

      if (sessionId) {
        navigate("/");
        setLoginSuccess({ sessionId });
      } else {
        console.error("로그인 응답에 세션 ID가 없음:", data);
        alert("로그인 정보를 가져올 수 없습니다.");
      }
    } catch (error) {
      // 로그인 실패 시 에러 메시지 처리
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";

      // 401 에러인 경우 더 친근한 메시지로 변경
      if (errorMessage.includes("이메일과 비밀번호를 다시 확인해주세요")) {
        showErrorAlert("이메일과 비밀번호를 다시 확인해주세요!");
      } else {
        showErrorAlert(`로그인 실패: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 구글 소셜 로그인
  const handleGoogleSignup = () => {
    try {
      const googleAuthUrl = generateGoogleOAuthURL();
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error("Google OAuth URL 생성 실패:", error);
      showErrorAlert(
        error instanceof Error
          ? error.message
          : "Google 로그인을 시작할 수 없습니다."
      );
    }
  };
  // 카카오 소셜 로그인
  const handleKakaoSignup = () => {
    const { CLIENT_ID, REDIRECT_URI, AUTH_URL, RESPONSE_TYPE, STATE } =
      OAUTH_CONFIG.KAKAO;
    const kakaoAuthUrl = `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&state=${STATE}&prompt=login`;
    window.location.href = kakaoAuthUrl;
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

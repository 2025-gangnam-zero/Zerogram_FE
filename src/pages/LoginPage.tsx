import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
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
  margin-top: 8px;
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

        // 1. 먼저 localStorage에 저장 (API 인터셉터가 사용할 수 있도록)
        localStorage.setItem("sessionId", sessionId);
        localStorage.setItem("userName", userName);

        // 2. Zustand 스토어에 저장
        login(sessionId, userName);

        // 3. userStore에도 세션 ID 설정
        const { setSessionId } = useUserStore.getState();
        setSessionId(sessionId);

        // 4. 잠시 대기 후 사용자 정보를 API로 가져오기 (세션 ID가 백엔드에 전파될 시간 확보)
        setTimeout(async () => {
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
        }, 500); // 500ms로 증가
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
      </LoginForm>
    </LoginContainer>
  );
};

export default LoginPage;

import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks/redux";
import { login } from "../store/authSlice";
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
  const dispatch = useAppDispatch();
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
      // 백엔드에서 세션ID와 사용자 이름을 body로 전송
      const sessionId =
        data.data?.sessionId ?? data.data?.session_id ?? data.data?.id;
      const userName =
        data.data?.name ?? data.data?.userName ?? data.data?.user_name;

      if (sessionId) {
        localStorage.setItem("sessionId", sessionId);
        localStorage.setItem("userName", userName);
        // Redux 상태 업데이트
        dispatch(login({ sessionId, userName }));
      }
      alert("로그인에 성공했습니다.");
      navigate("/");
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

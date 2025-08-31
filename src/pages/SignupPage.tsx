import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { signupApi } from "../api/auth";

const SignupContainer = styled.div`
  padding: 40px 20px;
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
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 40px;
  text-align: center;
`;

const SignupForm = styled.form`
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
  font-weight: 600;
`;

const ButtonContainer = styled.div`
  margin-top: 30px;
`;

const Divider = styled.div`
  margin: 30px 0;
  text-align: center;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e1e8ed;
  }

  span {
    background: white;
    padding: 0 20px;
    color: #95a5a6;
    font-size: 14px;
  }
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

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // 에러 메시지 초기화
      if (errors[field as keyof typeof errors]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      nickname: "",
    };

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요";
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 8자 이상이어야 합니다";
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      try {
        // signupApi 호출 (비밀번호 확인은 제외하고 전송)
        const { confirmPassword, ...signupData } = formData;
        await signupApi(signupData);

        // 회원가입 성공 시 로그인 페이지로 이동
        alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
        navigate("/login");
      } catch (error) {
        // 에러 처리
        if (error instanceof Error) {
          alert(`회원가입 실패: ${error.message}`);
        } else {
          alert("회원가입 중 오류가 발생했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignup = () => {
    // TODO: 구글 OAuth 로그인 구현
    console.log("구글 회원가입");
  };

  const handleKakaoSignup = () => {
    // TODO: 카카오 OAuth 로그인 구현
    console.log("카카오 회원가입");
  };

  return (
    <SignupContainer>
      <Title>회원가입</Title>
      <Subtitle>Zerogram에 가입하여 운동 라이프를 시작하세요</Subtitle>

      <SignupForm onSubmit={handleSubmit}>
        <FormTitle>계정 정보 입력</FormTitle>

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
          placeholder="비밀번호를 입력하세요 (8자 이상)"
          value={formData.password}
          onChange={handleInputChange("password")}
          error={errors.password}
          required
        />

        <Input
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          value={formData.confirmPassword}
          onChange={handleInputChange("confirmPassword")}
          error={errors.confirmPassword}
          required
        />

        <Input
          label="이름"
          type="text"
          placeholder="이름을 입력하세요"
          value={formData.name}
          onChange={handleInputChange("name")}
          error={errors.name}
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
            {isLoading ? "처리 중..." : "회원가입"}
          </Button>
        </ButtonContainer>

        <Divider>
          <span>또는</span>
        </Divider>

        <SocialButton type="button" onClick={handleGoogleSignup}>
          Google로 회원가입
        </SocialButton>

        <SocialButton type="button" onClick={handleKakaoSignup}>
          카카오로 회원가입
        </SocialButton>
      </SignupForm>
    </SignupContainer>
  );
};

export default SignupPage;

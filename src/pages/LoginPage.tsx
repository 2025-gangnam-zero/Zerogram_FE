import React from "react";
import styled from "styled-components";

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

const LoginPage: React.FC = () => {
  return (
    <LoginContainer>
      <Title>로그인</Title>
      <Subtitle>Zerogram에 로그인하여 서비스를 이용하세요</Subtitle>
    </LoginContainer>
  );
};

export default LoginPage;

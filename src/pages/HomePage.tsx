import React from "react";
import styled from "styled-components";

const HomeContainer = styled.div`
  padding: 40px 20px;
  text-align: center;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 30px;
  line-height: 1.6;
`;

const HomePage: React.FC = () => {
  return (
    <HomeContainer>
      <Title>Zerogram</Title>
      <Subtitle>운동인과 입문자를 위한 통합 플랫폼 서비스</Subtitle>
      <Subtitle>건강한 운동 라이프를 시작하세요</Subtitle>
    </HomeContainer>
  );
};

export default HomePage;

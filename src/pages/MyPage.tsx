import React from "react";
import styled from "styled-components";

const MyPageContainer = styled.div`
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

const MyPage: React.FC = () => {
  return (
    <MyPageContainer>
      <Title>마이페이지</Title>
      <Subtitle>내 정보와 활동 내역을 확인하세요</Subtitle>
    </MyPageContainer>
  );
};

export default MyPage;

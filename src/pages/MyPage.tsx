import React, { useEffect } from "react";
import styled from "styled-components";
import { useUserStore } from "../store/userStore";
import { useAuthStore } from "../store/authStore";

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

const LoadingText = styled.p`
  font-size: 1.2rem;
  color: #3498db;
`;

const ErrorText = styled.p`
  font-size: 1.2rem;
  color: #e74c3c;
`;

const MyPage: React.FC = () => {
  const { nickname, isLoading, error, fetchUserInfo } = useUserStore();
  const { isLoggedIn, checkAuthStatus } = useAuthStore();

  useEffect(() => {
    // 인증 상태를 다시 한 번 확인하여 동기화
    const actualIsLoggedIn = checkAuthStatus();
    console.log("MyPage 인증 상태 확인:", {
      hookIsLoggedIn: isLoggedIn,
      actualIsLoggedIn,
      hasNickname: !!nickname,
      isLoading,
      hasError: !!error,
    });

    // 로그인 상태이고 사용자 정보가 없을 때만 API 호출
    // 이미 로딩 중이거나 에러가 있으면 호출하지 않음
    if (actualIsLoggedIn && !nickname && !isLoading && !error) {
      console.log("MyPage에서 사용자 정보 조회 시작");
      fetchUserInfo().catch((error: unknown) => {
        console.error("사용자 정보 조회 실패:", error);
      });
    } else {
      console.log("MyPage 사용자 정보 조회 조건 미충족:", {
        isLoggedIn: actualIsLoggedIn,
        hasNickname: !!nickname,
        isLoading,
        hasError: !!error,
      });
    }
  }, [isLoggedIn, nickname, isLoading, error, fetchUserInfo, checkAuthStatus]);

  // 실제 인증 상태를 사용하여 렌더링
  const actualIsLoggedIn = checkAuthStatus();

  // 로그인하지 않은 경우
  if (!actualIsLoggedIn) {
    return (
      <MyPageContainer>
        <ErrorText>로그인이 필요합니다.</ErrorText>
      </MyPageContainer>
    );
  }

  if (isLoading) {
    return (
      <MyPageContainer>
        <LoadingText>사용자 정보를 불러오는 중...</LoadingText>
      </MyPageContainer>
    );
  }

  if (error) {
    return (
      <MyPageContainer>
        <ErrorText>오류: {error}</ErrorText>
      </MyPageContainer>
    );
  }

  const userName = nickname || "사용자";

  return (
    <MyPageContainer>
      <Title>{userName}님 마이페이지</Title>
      <Subtitle>내 정보와 활동 내역을 확인하세요</Subtitle>
    </MyPageContainer>
  );
};

export default MyPage;

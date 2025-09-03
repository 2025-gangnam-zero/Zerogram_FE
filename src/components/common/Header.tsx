import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuthStore } from "../../store/authStore";

const HeaderContainer = styled.header`
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const HeaderWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
`;

const Logo = styled.div`
  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    cursor: pointer;
    transition: color 0.3s ease;

    &:hover {
      color: #3498db;
    }
  }
`;

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LoginBtn = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #2980b9;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SignupBtn = styled.button`
  background-color: transparent;
  color: #3498db;
  border: 2px solid #3498db;
  padding: 10px 22px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #3498db;
    color: white;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LogoutBtn = styled.button`
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #c0392b;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MyPageBtn = styled.button`
  background-color: #9b59b6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #8e44ad;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(155, 89, 182, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout, initializeAuth, checkAuthStatus } =
    useAuthStore();

  useEffect(() => {
    // 앱 시작 시 인증 상태 초기화
    initializeAuth();

    // 인증 상태 변경 이벤트 리스너
    const handleUnauthorized = () => {
      checkAuthStatus(); // Zustand 스토어 상태 동기화
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [initializeAuth, checkAuthStatus]);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/");
  };

  const handleMyPageClick = () => {
    navigate("/mypage");
  };

  return (
    <HeaderContainer>
      <HeaderWrapper>
        <Logo onClick={handleLogoClick}>
          <h1>Zerogram</h1>
        </Logo>
        <AuthSection>
          {isLoggedIn ? (
            <UserMenu>
              <MyPageBtn onClick={handleMyPageClick}>마이페이지</MyPageBtn>
              <LogoutBtn onClick={handleLogoutClick}>로그아웃</LogoutBtn>
            </UserMenu>
          ) : (
            <>
              <LoginBtn onClick={handleLoginClick}>로그인</LoginBtn>
              <SignupBtn onClick={handleSignupClick}>회원가입</SignupBtn>
            </>
          )}
        </AuthSection>
      </HeaderWrapper>
    </HeaderContainer>
  );
};

export default Header;

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { Menu, X, User, LogOut, Home } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { UI_CONSTANTS, LAYOUT_CONSTANTS } from "../../constants";

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
  max-width: ${LAYOUT_CONSTANTS.MAX_WIDTH};
  margin: 0 auto;
  padding: 0 ${LAYOUT_CONSTANTS.CONTAINER_PADDING};
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${LAYOUT_CONSTANTS.HEADER_HEIGHT};
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONSTANTS.SPACING.XL};
`;

const Logo = styled.div`
  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    cursor: pointer;
    transition: color ${UI_CONSTANTS.TRANSITIONS.NORMAL};

    &:hover {
      color: ${UI_CONSTANTS.COLORS.PRIMARY};
    }
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: ${UI_CONSTANTS.SPACING.LG};

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.button<{ $isActive: boolean }>`
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: ${({ $isActive }) =>
    $isActive ? UI_CONSTANTS.COLORS.PRIMARY : UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  cursor: pointer;
  padding: 8px 16px;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};
  position: relative;

  &:hover {
    color: ${UI_CONSTANTS.COLORS.PRIMARY};
    background-color: ${UI_CONSTANTS.COLORS.LIGHT};
  }

  ${({ $isActive }) =>
    $isActive &&
    `
    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 2px;
      background-color: ${UI_CONSTANTS.COLORS.PRIMARY};
    }
  `}

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 14px;
  }
`;

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONSTANTS.SPACING.MD};
`;

const LoginBtn = styled.button`
  background-color: ${UI_CONSTANTS.COLORS.PRIMARY};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:hover {
    background-color: ${UI_CONSTANTS.COLORS.PRIMARY_HOVER};
    transform: translateY(-1px);
    box-shadow: ${UI_CONSTANTS.SHADOWS.XL};
  }

  &:active {
    transform: translateY(0);
  }
`;

const SignupBtn = styled.button`
  background-color: transparent;
  color: rgb(27, 219, 49);
  border: 2px solid rgb(27, 219, 49);
  padding: 10px 22px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgb(27, 219, 49);
    color: white;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

// const LogoutBtn = styled.button`
//   background-color: #e74c3c;
//   color: white;
//   border: none;
//   padding: 12px 24px;
//   border-radius: 6px;
//   font-size: 16px;
//   font-weight: 600;
//   cursor: pointer;
//   transition: all 0.3s ease;

//   &:hover {
//     background-color: #c0392b;
//     transform: translateY(-1px);
//     box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
//   }

//   &:active {
//     transform: translateY(0);
//   }
// `;

// const MyPageBtn = styled.button`
//   background-color: #9b59b6;
//   color: white;
//   border: none;
//   padding: 12px 24px;
//   border-radius: 6px;
//   font-size: 16px;
//   font-weight: 600;
//   cursor: pointer;
//   transition: all 0.3s ease;

//   &:hover {
//     background-color: #8e44ad;
//     transform: translateY(-1px);
//     box-shadow: 0 4px 8px rgba(155, 89, 182, 0.3);
//   }

//   &:active {
//     transform: translateY(0);
//   }
// `;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    background-color: ${UI_CONSTANTS.COLORS.LIGHT};
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: ${LAYOUT_CONSTANTS.HEADER_HEIGHT};
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 999;
  transform: ${({ $isOpen }) =>
    $isOpen ? "translateY(0)" : "translateY(-100%)"};
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileNav = styled.nav`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MobileNavLink = styled.button<{ $isActive: boolean }>`
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: ${({ $isActive }) =>
    $isActive ? UI_CONSTANTS.COLORS.PRIMARY : UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  cursor: pointer;
  padding: 12px 16px;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
  text-align: left;
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:hover {
    color: ${UI_CONSTANTS.COLORS.PRIMARY};
    background-color: ${UI_CONSTANTS.COLORS.LIGHT};
  }

  ${({ $isActive }) =>
    $isActive &&
    `
    background-color: ${UI_CONSTANTS.COLORS.LIGHT};
    border-left: 3px solid ${UI_CONSTANTS.COLORS.PRIMARY};
  `}
`;

const UserMenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  font-weight: 600;
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:hover {
    background-color: ${UI_CONSTANTS.COLORS.LIGHT};
  }

  @media (max-width: 768px) {
    padding: 6px 8px;
    font-size: 14px;
  }
`;

const UserDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
  box-shadow: ${UI_CONSTANTS.SHADOWS.XL};
  border: 1px solid #e1e5e9;
  min-width: 160px;
  z-index: 1001;
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  padding: 12px 16px;
  font-size: 14px;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  text-align: left;
  transition: background-color ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:hover {
    background-color: ${UI_CONSTANTS.COLORS.LIGHT};
  }

  &:first-child {
    border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM}
      ${UI_CONSTANTS.BORDER_RADIUS.SM} 0 0;
  }

  &:last-child {
    border-radius: 0 0 ${UI_CONSTANTS.BORDER_RADIUS.SM}
      ${UI_CONSTANTS.BORDER_RADIUS.SM};
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
`;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, logout, initializeAuth, checkAuthStatus } =
    useAuthStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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

  const handleLogoutClick = async () => {
    await logout();
    navigate("/");
  };

  const handleMyPageClick = () => {
    navigate("/mypage");
  };

  const handleWorkoutClick = () => {
    navigate("/workout");
  };
  const handleDietClick = () => {
    navigate("/diet-log");
  };

  const handleMeetClick = () => {
    navigate("/meet");
  };

  const handleChatClick = () => {
    navigate("/chat");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsMobileMenuOpen(false);
  };

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleMobileNavClick = (onClick: () => void) => {
    onClick();
    closeMenus();
  };

  // 추후 확장될 네비게이션 메뉴들
  const navigationItems = [
    { path: "/workout", label: "운동일지", onClick: handleWorkoutClick },
    { path: "/diet-log", label: "식단일지", onClick: handleDietClick },
    { path: "/meet", label: "모집게시판", onClick: handleMeetClick },
    { path: "/chat", label: "채팅", onClick: handleChatClick },
  ];

  return (
    <>
      <HeaderContainer>
        <HeaderWrapper>
          <LeftSection>
            <Logo onClick={handleLogoClick}>
              <h1>Zerogram</h1>
            </Logo>
            {isLoggedIn && (
              <Navigation>
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.path}
                    $isActive={location.pathname === item.path}
                    onClick={item.onClick}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </Navigation>
            )}
          </LeftSection>
          <AuthSection>
            {isLoggedIn ? (
              <UserMenu>
                <UserMenuButton onClick={toggleUserMenu}>
                  <User size={20} />
                </UserMenuButton>
                <UserDropdown $isOpen={isUserMenuOpen}>
                  <DropdownItem onClick={handleMyPageClick}>
                    <Home size={16} />
                    마이페이지
                  </DropdownItem>
                  <DropdownItem onClick={handleLogoutClick}>
                    <LogOut size={16} />
                    로그아웃
                  </DropdownItem>
                </UserDropdown>
                <MobileMenuButton onClick={toggleMobileMenu}>
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </MobileMenuButton>
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

      {isLoggedIn && (
        <MobileMenu $isOpen={isMobileMenuOpen}>
          <MobileNav>
            {navigationItems.map((item) => (
              <MobileNavLink
                key={item.path}
                $isActive={location.pathname === item.path}
                onClick={() => handleMobileNavClick(item.onClick)}
              >
                {item.label}
              </MobileNavLink>
            ))}
          </MobileNav>
        </MobileMenu>
      )}

      <Overlay
        $isOpen={isMobileMenuOpen || isUserMenuOpen}
        onClick={closeMenus}
      />
    </>
  );
};

export default Header;

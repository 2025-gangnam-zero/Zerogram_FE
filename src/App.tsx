import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import styled from "styled-components";
import { useUserStore } from "./store/userStore";
import { useAuthStore } from "./store/authStore";
import GlobalStyle from "./styles/GlobalStyle";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyPage from "./pages/MyPage";

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding-top: 70px; /* Header 높이만큼 상단 여백 */
  min-height: calc(100vh - 70px - 200px); /* Header + Footer 높이 제외 */
`;

const AppContent: React.FC = () => {
  const { fetchUserInfo } = useUserStore();
  const { initializeAuth, checkAuthStatus } = useAuthStore();

  useEffect(() => {
    // 앱 시작 시 인증 상태 초기화
    initializeAuth();

    // 인증 상태 확인 후 사용자 정보 가져오기
    const isAuthenticated = checkAuthStatus();
    if (isAuthenticated) {
      fetchUserInfo().catch((error: unknown) => {
        console.error("사용자 정보 조회 실패:", error);
        // 401 에러가 발생하면 인증 상태를 초기화
        if (error instanceof Error && error.message.includes("인증")) {
          localStorage.removeItem("sessionId");
          localStorage.removeItem("userName");
          window.location.reload(); // 페이지 새로고침으로 상태 동기화
        }
      });
    }
  }, [initializeAuth, checkAuthStatus, fetchUserInfo]);

  return (
    <Router>
      <GlobalStyle />
      <AppContainer>
        <Header />
        <MainContent>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </MainContent>
        <Footer />
      </AppContainer>
    </Router>
  );
};

function App() {
  return <AppContent />;
}

export default App;

import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import styled from "styled-components";
import { useAuthStore } from "./store/authStore";
import GlobalStyle from "./styles/GlobalStyle";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyPage from "./pages/MyPage";
import { LAYOUT_CONSTANTS } from "./constants";

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding-top: ${LAYOUT_CONSTANTS.HEADER_HEIGHT}; /* Header 높이만큼 상단 여백 */
  min-height: calc(
    100vh - ${LAYOUT_CONSTANTS.HEADER_HEIGHT} -
      ${LAYOUT_CONSTANTS.FOOTER_HEIGHT}
  ); /* Header + Footer 높이 제외 */
`;

const AppContent: React.FC = () => {
  const { initializeAuth, checkAuthStatus, isLoggedIn } = useAuthStore();

  useEffect(() => {
    // 앱 시작 시 인증 상태 초기화만 수행
    initializeAuth();

    // 인증 상태 확인 및 동기화
    const isAuthenticated = checkAuthStatus();
    console.log("앱 시작 시 인증 상태:", isAuthenticated);

    // 인증된 상태라면 userStore도 동기화
    if (isAuthenticated) {
      try {
        const { setSessionId } =
          require("./store/userStore").useUserStore.getState();
        const sessionId = localStorage.getItem("sessionId");
        if (sessionId) {
          setSessionId(sessionId);
          console.log("App에서 userStore 동기화 완료:", sessionId);
        }
      } catch (error) {
        console.warn("App에서 userStore 동기화 실패:", error);
      }
    }

    // 사용자 정보는 로그인 후에만 가져오도록 함
    // 여기서는 fetchUserInfo를 호출하지 않음
  }, [initializeAuth, checkAuthStatus]);

  return (
    <Router>
      <GlobalStyle />
      <AppContainer>
        <Header />
        <MainContent>
          <Routes>
            <Route
              path="/"
              element={isLoggedIn ? <HomePage /> : <LandingPage />}
            />
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

import { Route, Routes, useLocation } from "react-router-dom";
import GlobalStyle from "../styles/GlobalStyle";
import { LAYOUT_CONSTANTS } from "../constants";
import styled from "styled-components";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import HomePage from "../pages/HomePage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import MyPage from "../pages/MyPage";
import WorkoutLogPage from "../pages/WorkoutLogPage";
import DietLogPage from "../pages/DietLogPage";

import { useAuthStore } from "../store/authStore";
import { ChatIndex, ChatPage } from "../pages/chat";
import { ChatSection } from "../components/chat/ChatSection";

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

export default function Router() {
  const { isLoggedIn } = useAuthStore();
  const { pathname } = useLocation();
  const isChatRoute = pathname.startsWith("/chat"); // 채팅 페이지면 푸터 숨김

  return (
    <>
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
            <Route path="/workout" element={<WorkoutLogPage />} />
            <Route path="/diet-log" element={<DietLogPage />} />

            <Route path="/chat" element={<ChatPage />}>
              <Route index element={<ChatIndex />} />
              <Route path=":roomid" element={<ChatSection />} />
            </Route>
          </Routes>
        </MainContent>
        {!isChatRoute && <Footer />}
      </AppContainer>
    </>
  );
}

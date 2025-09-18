import { Route, Routes } from "react-router-dom";
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
import MeetPage from "../pages/MeetPage";

import { useAuthStore } from "../store/authStore";

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
            <Route path="/meet" element={<MeetPage />} />
          </Routes>
        </MainContent>
        <Footer />
      </AppContainer>
    </>
  );
}

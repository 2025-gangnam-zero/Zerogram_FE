import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AUTH_CONSTANTS } from "../constants";
import { clearAuthData } from "../utils";
import { logoutApi } from "../api/auth";
import { unsubscribeApi } from "../api/auth";

interface AuthState {
  isLoggedIn: boolean;
  sessionId: string | null;
}

interface AuthActions {
  login: (sessionId: string) => void;
  logout: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  initializeAuth: () => void;
  checkAuthStatus: () => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      isLoggedIn: false,
      sessionId: null,

      // Actions
      login: (sessionId: string) => {
        // localStorage는 이미 LoginPage에서 저장됨
        // Zustand 스토어에만 저장
        set({
          isLoggedIn: true,
          sessionId,
        });

        // userStore와도 동기화
        try {
          const { setSessionId } =
            require("./userStore").useUserStore.getState();
          setSessionId(sessionId);
        } catch (error) {
          console.warn("userStore 동기화 실패:", error);
        }
      },

      logout: async () => {
        try {
          // 백엔드에 로그아웃 요청
          await logoutApi();
          console.log("백엔드 로그아웃 요청 성공");
        } catch (error) {
          console.error("백엔드 로그아웃 요청 실패:", error);
          // 백엔드 요청이 실패해도 로컬 상태는 정리
        }

        // localStorage에서 제거
        clearAuthData();

        // Zustand 스토어에서 제거
        set({
          isLoggedIn: false,
          sessionId: null,
        });

        // userStore도 초기화
        try {
          const { clearUser } = require("./userStore").useUserStore.getState();
          clearUser();
          console.log("로그아웃: userStore 초기화 완료");
        } catch (error) {
          console.warn("userStore 초기화 실패:", error);
        }
      },

      // 회원 탈퇴
      unsubscribe: async () => {
        try {
          // 백엔드에 회원 탈퇴 요청
          await unsubscribeApi();
          console.log("회원 탈퇴 성공");

          // localStorage에서 제거
          clearAuthData();

          // Zustand 스토어에서 제거
          set({
            isLoggedIn: false,
            sessionId: null,
          });

          // userStore도 초기화
          try {
            const { clearUser } =
              require("./userStore").useUserStore.getState();
            clearUser();
            console.log("회원 탈퇴: userStore 초기화 완료");
          } catch (error) {
            console.warn("userStore 초기화 실패:", error);
          }
        } catch (error) {
          console.error("회원 탈퇴 실패:", error);
          throw error;
        }
      },

      initializeAuth: () => {
        const sessionId = localStorage.getItem(AUTH_CONSTANTS.SESSION_ID_KEY);

        if (sessionId) {
          set({
            isLoggedIn: true,
            sessionId,
          });
        } else {
          // localStorage에 세션 ID가 없으면 로그아웃 상태로 설정
          set({
            isLoggedIn: false,
            sessionId: null,
          });
        }
      },

      checkAuthStatus: () => {
        const sessionId = localStorage.getItem(AUTH_CONSTANTS.SESSION_ID_KEY);
        const currentState = get();

        // localStorage와 Zustand 스토어 상태가 일치하는지 확인
        if (sessionId && !currentState.isLoggedIn) {
          // localStorage에는 있지만 Zustand에는 없는 경우 동기화
          set({
            isLoggedIn: true,
            sessionId,
          });
        } else if (!sessionId && currentState.isLoggedIn) {
          // localStorage에는 없지만 Zustand에는 있는 경우
          set({
            isLoggedIn: false,
            sessionId: null,
          });

          // userStore와도 동기화
          try {
            const { clearUser } =
              require("./userStore").useUserStore.getState();
            clearUser();
            console.log("authStore에서 userStore 정리 완료");
          } catch (error) {
            console.warn("userStore 정리 실패:", error);
          }

          return false;
        }

        return currentState.isLoggedIn;
      },
    }),
    {
      name: AUTH_CONSTANTS.STORAGE_NAME,
      partialize: (state) => ({
        sessionId: state.sessionId,
      }),
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  isLoggedIn: boolean;
  sessionId: string | null;
  userName: string | null;
}

interface AuthActions {
  login: (sessionId: string, userName: string) => void;
  logout: () => void;
  initializeAuth: () => void;
  checkAuthStatus: () => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      isLoggedIn: false,
      sessionId: null,
      userName: null,

      // Actions
      login: (sessionId: string, userName: string) => {
        // localStorage는 이미 LoginPage에서 저장됨
        // Zustand 스토어에만 저장
        set({
          isLoggedIn: true,
          sessionId,
          userName,
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

      logout: () => {
        // localStorage에서 제거
        localStorage.removeItem("sessionId");
        localStorage.removeItem("userName");

        // Zustand 스토어에서 제거
        set({
          isLoggedIn: false,
          sessionId: null,
          userName: null,
        });
      },

      initializeAuth: () => {
        const sessionId = localStorage.getItem("sessionId");
        const userName = localStorage.getItem("userName");

        if (sessionId && userName) {
          set({
            isLoggedIn: true,
            sessionId,
            userName,
          });
        } else {
          // localStorage에 세션 ID가 없으면 로그아웃 상태로 설정
          set({
            isLoggedIn: false,
            sessionId: null,
            userName: null,
          });
        }
      },

      checkAuthStatus: () => {
        const sessionId = localStorage.getItem("sessionId");
        const currentState = get();

        // localStorage와 Zustand 스토어 상태가 일치하는지 확인
        if (sessionId && !currentState.isLoggedIn) {
          // localStorage에는 있지만 Zustand에는 없는 경우
          const userName = localStorage.getItem("userName");
          if (userName) {
            set({
              isLoggedIn: true,
              sessionId,
              userName,
            });

            // userStore와도 동기화
            try {
              const { setSessionId } =
                require("./userStore").useUserStore.getState();
              setSessionId(sessionId);
              console.log("authStore에서 userStore 동기화 완료:", sessionId);
            } catch (error) {
              console.warn("userStore 동기화 실패:", error);
            }

            return true;
          }
        } else if (!sessionId && currentState.isLoggedIn) {
          // localStorage에는 없지만 Zustand에는 있는 경우
          set({
            isLoggedIn: false,
            sessionId: null,
            userName: null,
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
      name: "auth-storage",
      partialize: (state) => ({
        sessionId: state.sessionId,
        userName: state.userName,
      }),
    }
  )
);

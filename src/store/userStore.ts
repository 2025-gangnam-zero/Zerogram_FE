import { create } from "zustand";
import { getUserInfoApi } from "../api/auth";
import { AUTH_CONSTANTS } from "../constants";
import { UserProfile } from "../types";

interface UserState {
  id: string | null;
  nickname: string | null;
  email: string | null;
  password: string | null;
  profile_image?: string;
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  login_type: string | null;
}

interface UserActions {
  setUser: (user: UserProfile) => void;
  clearUser: () => void;
  setSessionId: (sessionId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchUserInfo: () => Promise<void>;
}

export const useUserStore = create<UserState & UserActions>((set, get) => ({
  // State
  id: null,
  nickname: null,
  email: null,
  password: null,
  profile_image: undefined,
  sessionId: null,
  isLoading: false,
  error: null,
  login_type: null,

  // Actions
  setUser: (user) => {
    set({
      nickname: user.nickname,
      sessionId: user.sessionId,
      id: user.id || null,
      password: user.password || null,
      profile_image: user.profile_image || undefined,
      login_type: user.login_type || null,
      error: null,
    });
  },

  clearUser: () => {
    set({
      id: null,
      nickname: null,
      email: null,
      password: null,
      profile_image: undefined,
      sessionId: null,
      error: null,
      login_type: null,
    });
  },

  setSessionId: (sessionId) => {
    set({ sessionId });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  fetchUserInfo: async () => {
    try {
      // 이미 로딩 중이면 중복 호출 방지
      if (get().isLoading) {
        console.log("이미 사용자 정보를 가져오는 중입니다.");
        return;
      }

      // 이미 사용자 정보가 있으면 중복 호출 방지
      if (get().nickname && get().id) {
        console.log("이미 사용자 정보가 있습니다:", get().nickname);
        return;
      }

      // 세션 ID 확인 (localStorage 우선, Zustand 스토어 차선)
      let sessionId = localStorage.getItem(AUTH_CONSTANTS.SESSION_ID_KEY);
      console.log("fetchUserInfo 시작 - localStorage 세션 ID:", sessionId);

      if (!sessionId) {
        // localStorage에 없으면 Zustand 스토어에서 확인
        const storeSessionId = get().sessionId;
        console.log("fetchUserInfo - Zustand 스토어 세션 ID:", storeSessionId);

        if (storeSessionId) {
          sessionId = storeSessionId;
          console.log("Zustand 스토어에서 세션 ID 사용:", sessionId);
        } else {
          // authStore에서도 확인
          try {
            const { checkAuthStatus } =
              require("./authStore").useAuthStore.getState();
            const isAuth = checkAuthStatus();
            if (isAuth) {
              const authSessionId = localStorage.getItem(
                AUTH_CONSTANTS.SESSION_ID_KEY
              );
              if (authSessionId) {
                sessionId = authSessionId;
                console.log("authStore에서 세션 ID 동기화:", sessionId);
              }
            }
          } catch (error) {
            console.warn("authStore 확인 실패:", error);
          }

          if (!sessionId) {
            throw new Error("세션 ID가 존재하지 않습니다.");
          }
        }
      }

      // Zustand 스토어 동기화 - 강제로 업데이트
      const storeSessionId = get().sessionId;
      if (sessionId !== storeSessionId) {
        console.warn("localStorage와 Zustand 스토어의 세션 ID가 일치하지 않음");
        console.log("localStorage:", sessionId, "Zustand:", storeSessionId);
        // Zustand 스토어 강제 동기화
        set({ sessionId });
        console.log("Zustand 스토어 세션 ID 동기화 완료:", sessionId);
      }

      console.log("사용자 정보 조회 시작, 세션 ID:", sessionId);
      set({ isLoading: true, error: null });

      const response = await getUserInfoApi();
      const userData = response.data.user;

      console.log("사용자 정보 조회 성공:", userData);
      set({
        isLoading: false,
        id: userData._id,
        nickname: userData.nickname,
        email: userData.email,
        profile_image: userData.profile_image || null,
        error: null,
        // 세션 ID도 함께 업데이트하여 동기화 보장
        sessionId: sessionId,
        login_type: userData.login_type,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "사용자 정보를 가져올 수 없습니다.";

      console.error("사용자 정보 조회 실패:", error);
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },
}));

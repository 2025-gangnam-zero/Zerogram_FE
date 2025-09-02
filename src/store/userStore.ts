import { create } from "zustand";
import { getUserInfoApi } from "../api/auth";

interface UserState {
  id: string | null;
  nickname: string | null;
  email: string | null;
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  setUser: (user: {
    id?: string;
    nickname: string;
    email?: string;
    sessionId: string;
  }) => void;
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
  sessionId: null,
  isLoading: false,
  error: null,

  // Actions
  setUser: (user) => {
    set({
      nickname: user.nickname,
      sessionId: user.sessionId,
      id: user.id || null,
      email: user.email || null,
      error: null,
    });
  },

  clearUser: () => {
    set({
      id: null,
      nickname: null,
      email: null,
      sessionId: null,
      error: null,
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
      // 세션 ID 확인 (localStorage 우선, Zustand 스토어 차선)
      let sessionId = localStorage.getItem("sessionId");
      console.log("fetchUserInfo 시작 - localStorage 세션 ID:", sessionId);

      if (!sessionId) {
        // localStorage에 없으면 Zustand 스토어에서 확인
        const storeSessionId = get().sessionId;
        console.log("fetchUserInfo - Zustand 스토어 세션 ID:", storeSessionId);

        if (storeSessionId) {
          sessionId = storeSessionId;
          console.log("Zustand 스토어에서 세션 ID 사용:", sessionId);
        } else {
          throw new Error("세션 ID가 존재하지 않습니다.");
        }
      }

      // Zustand 스토어 동기화
      const storeSessionId = get().sessionId;
      if (sessionId !== storeSessionId) {
        console.warn("localStorage와 Zustand 스토어의 세션 ID가 일치하지 않음");
        console.log("localStorage:", sessionId, "Zustand:", storeSessionId);
        // Zustand 스토어 동기화
        set({ sessionId });
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
        error: null,
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

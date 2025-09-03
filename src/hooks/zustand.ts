// Zustand hooks for backward compatibility
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "../store/userStore";

// Auth store selectors
export const useAuth = () => useAuthStore();
export const useAuthState = () =>
  useAuthStore((state) => ({
    isLoggedIn: state.isLoggedIn,
    sessionId: state.sessionId,
  }));

// User store selectors
export const useUser = () => useUserStore();
export const useUserState = () =>
  useUserStore((state) => ({
    id: state.id,
    nickname: state.nickname,
    email: state.email,
    sessionId: state.sessionId,
    isLoading: state.isLoading,
    error: state.error,
  }));

// Legacy Redux-style hooks for smooth migration
export const useAppDispatch = () => ({
  auth: useAuthStore(),
  user: useUserStore(),
});

export const useAppSelector = <T>(selector: (state: any) => T): T => {
  // This is a compatibility layer - components should use Zustand hooks directly
  throw new Error(
    "useAppSelector is deprecated. Use Zustand hooks directly instead."
  );
};

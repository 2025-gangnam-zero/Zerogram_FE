// Zustand stores
export { useAuthStore } from "./authStore";
export { useUserStore } from "./userStore";

// Store types for backward compatibility
export type RootState = {
  auth: ReturnType<typeof import("./authStore").useAuthStore>;
  user: ReturnType<typeof import("./userStore").useUserStore>;
};

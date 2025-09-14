// 모든 스토어들을 한 곳에서 export
export * from "./authStore";
export * from "./userStore";
export * from "./workoutStore";
export * from "./dietStore";
export * from "./messageStore";
export * from "./composerStore";

// Store types for backward compatibility
export type RootState = {
  auth: ReturnType<typeof import("./authStore").useAuthStore>;
  user: ReturnType<typeof import("./userStore").useUserStore>;
  diet: ReturnType<typeof import("./dietStore").useDietStore>;
  message: ReturnType<typeof import("./messageStore").useMessagesStore>;
  composer: ReturnType<typeof import("./composerStore").useComposerStore>;
};

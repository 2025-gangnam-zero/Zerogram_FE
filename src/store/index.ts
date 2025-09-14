// 모든 스토어들을 한 곳에서 export
export * from "./authStore";
export * from "./userStore";
export * from "./workoutStore";
export * from "./dietStore";
export * from "./composerStore";
export * from "./roomsStore";
export * from "./messagesStore";
export * from "./chatUIStore";
export * from "./chatNotificationStore";

// Store types for backward compatibility
export type RootState = {
  auth: ReturnType<typeof import("./authStore").useAuthStore>;
  user: ReturnType<typeof import("./userStore").useUserStore>;
  diet: ReturnType<typeof import("./dietStore").useDietStore>;
  composer: ReturnType<typeof import("./composerStore").useComposerStore>;
  room: ReturnType<typeof import("./roomsStore").useRoomsStore>;
  message: ReturnType<typeof import("./messagesStore").useMessagesStore>;
  chatUI: ReturnType<typeof import("./chatUIStore").useChatUIStore>;
  chatNotification: ReturnType<
    typeof import("./chatNotificationStore").useChatNotificationStore
  >;
};

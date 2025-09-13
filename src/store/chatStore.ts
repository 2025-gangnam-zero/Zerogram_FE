import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  Room,
  RoomMember,
  Message,
  LastMessage,
  CHThread,
} from "../types/chat";

import {
  createRoomsSlice,
  type RoomsSlice,
  createMembersSlice,
  type MembersSlice,
  createMessagesSlice,
  type MessagesSlice,
  createReceiptsSlice,
  type ReceiptsSlice,
  createChatUiSlice,
  type ChatUiSlice,
} from "./chatSlices";

/** 공통 유틸 */
const toLastMessage = (m: Message): LastMessage => ({
  id: m.id,
  author: { id: m.authorId, name: m.authorName },
  type: "text",
  text: m.content,
  createdAt: m.createdAt,
});

export type RootState = RoomsSlice &
  MembersSlice &
  MessagesSlice &
  ReceiptsSlice &
  ChatUiSlice & {
    selectThreads: () => CHThread[];
    selectMessages: (roomId: string) => Message[];
    selectActiveRoom: () => Room | undefined;
    selectMembers: (roomId: string) => RoomMember[];
    selectUnreadOthers: (msgId: string) => number;
  };

export const useChatStore = create<RootState>()(
  devtools(
    persist(
      (set, get) => ({
        ...createRoomsSlice(set, get),
        ...createMembersSlice(set, get),
        ...createMessagesSlice(set, get),
        ...createReceiptsSlice(set, get),
        ...createChatUiSlice(set, get),

        /** 파생 셀렉터 */
        selectThreads: () => {
          const s = get();
          return s.roomOrder.map<CHThread>((roomId) => {
            const room = s.roomsById[roomId];
            const ids = s.messageIdsByRoomId[roomId] ?? [];
            const last = ids.length
              ? s.messagesById[ids[ids.length - 1]]
              : undefined;
            return {
              id: roomId,
              room,
              lastMessage: last ? toLastMessage(last) : undefined,
              unreadCount: s.unreadCountByRoom[roomId] ?? 0,
            };
          });
        },

        selectMessages: (roomId: string) => {
          const s = get();
          const ids = s.messageIdsByRoomId[roomId] ?? [];
          return ids.map((id) => s.messagesById[id]).filter(Boolean);
        },

        selectActiveRoom: () => {
          const s = get();
          return s.activeRoomId ? s.roomsById[s.activeRoomId] : undefined;
        },

        selectMembers: (roomId: string) => {
          const s = get();
          return s.membersByRoomId[roomId] ?? [];
        },

        selectUnreadOthers: (msgId: string) => {
          const s = get();
          return s.unreadOthersByMessageId[msgId] ?? 0;
        },
      }),
      {
        name: "chat-store",
        partialize: (s) => ({
          activeRoomId: s.activeRoomId,
          draftByRoomId: s.draftByRoomId,
          roomOrder: s.roomOrder,
          roomsById: s.roomsById,
        }),
      }
    )
  )
);

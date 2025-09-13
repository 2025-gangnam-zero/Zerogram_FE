import type { Message } from "../../types/chat";
import type { RootState } from "../chatStore";

export type MessagesSlice = {
  messagesById: Record<string, Message>;
  messageIdsByRoomId: Record<string, string[]>;
  beforeCursorByRoomId: Record<string, string | undefined>;

  setInitialMessages: (roomId: string, messages: Message[]) => void;
  prependMessages: (roomId: string, older: Message[], cursor?: string) => void;
  receiveNewMessage: (roomId: string, m: Message) => void;
  editMessage: (msgId: string, patch: Partial<Message>) => void;
  deleteMessage: (msgId: string) => void;
};

export const createMessagesSlice = (set: any, get: any): MessagesSlice => ({
  messagesById: {},
  messageIdsByRoomId: {},
  beforeCursorByRoomId: {},

  setInitialMessages: (roomId, messages) =>
    set((s: RootState) => {
      const ids = [...messages]
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((m) => m.id);
      const nextEntities = { ...s.messagesById };
      messages.forEach((m) => (nextEntities[m.id] = m));
      return {
        messagesById: nextEntities,
        messageIdsByRoomId: { ...s.messageIdsByRoomId, [roomId]: ids },
      };
    }),

  prependMessages: (roomId, older, cursor) =>
    set((s: RootState) => {
      const prevIds = s.messageIdsByRoomId[roomId] ?? [];
      const nextEntities = { ...s.messagesById };
      older.forEach((m) => (nextEntities[m.id] = m));
      const newIds = [...older]
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((m) => m.id);
      return {
        messagesById: nextEntities,
        messageIdsByRoomId: {
          ...s.messageIdsByRoomId,
          [roomId]: [...newIds, ...prevIds],
        },
        beforeCursorByRoomId: { ...s.beforeCursorByRoomId, [roomId]: cursor },
      };
    }),

  receiveNewMessage: (roomId, m) =>
    set((s: RootState) => {
      const ids = s.messageIdsByRoomId[roomId] ?? [];
      if (ids.includes(m.id)) {
        return { messagesById: { ...s.messagesById, [m.id]: m } };
      }
      return {
        messagesById: { ...s.messagesById, [m.id]: m },
        messageIdsByRoomId: {
          ...s.messageIdsByRoomId,
          [roomId]: [...ids, m.id],
        },
      };
    }),

  editMessage: (msgId, patch) =>
    set((s: RootState) => ({
      messagesById: {
        ...s.messagesById,
        [msgId]: { ...s.messagesById[msgId], ...patch },
      },
    })),

  deleteMessage: (msgId) =>
    set((s: RootState) => {
      const next = { ...s.messagesById };
      delete next[msgId];
      const idsMap = Object.fromEntries(
        Object.entries(s.messageIdsByRoomId).map(([rid, ids]) => [
          rid,
          ids.filter((id) => id !== msgId),
        ])
      );
      return { messagesById: next, messageIdsByRoomId: idsMap };
    }),
});

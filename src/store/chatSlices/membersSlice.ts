import type { RoomMember } from "../../types/chat";
import type { RootState } from "../chatStore";

export type MembersSlice = {
  membersByRoomId: Record<string, RoomMember[]>;
  setMembers: (roomId: string, members: RoomMember[]) => void;
  upsertMember: (roomId: string, member: RoomMember) => void;
  removeMember: (roomId: string, userId: string) => void;
};

export const createMembersSlice = (set: any, get: any): MembersSlice => ({
  membersByRoomId: {},

  setMembers: (roomId, members) =>
    set((s: RootState) => ({
      membersByRoomId: { ...s.membersByRoomId, [roomId]: members },
    })),

  upsertMember: (roomId, member) =>
    set((s: RootState) => {
      const list = s.membersByRoomId[roomId] ?? [];
      const i = list.findIndex((m) => m.user.id === member.user.id);
      const next =
        i >= 0
          ? [...list.slice(0, i), member, ...list.slice(i + 1)]
          : [...list, member];
      return { membersByRoomId: { ...s.membersByRoomId, [roomId]: next } };
    }),

  removeMember: (roomId, userId) =>
    set((s: RootState) => {
      const list = s.membersByRoomId[roomId] ?? [];
      const next = list.filter((m) => m.user.id !== userId);
      return { membersByRoomId: { ...s.membersByRoomId, [roomId]: next } };
    }),
});

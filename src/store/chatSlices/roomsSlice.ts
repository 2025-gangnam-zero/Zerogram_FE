import type { Room } from "../../types/chat";
import type { RootState } from "../chatStore";

export type RoomsSlice = {
  roomsById: Record<string, Room>;
  roomOrder: string[];
  activeRoomId?: string;

  setRooms: (rooms: Room[]) => void;
  upsertRoom: (room: Room) => void;
  setActiveRoom: (roomId: string) => void;
};

export const createRoomsSlice = (set: any, get: any): RoomsSlice => ({
  roomsById: {},
  roomOrder: [],
  activeRoomId: undefined,

  setRooms: (rooms) =>
    set((s: RootState) => {
      const next = { ...s.roomsById };
      rooms.forEach((r) => (next[r.id] = r));
      return { roomsById: next, roomOrder: rooms.map((r) => r.id) };
    }),

  upsertRoom: (room) =>
    set((s: RootState) => ({
      roomsById: { ...s.roomsById, [room.id]: room },
      roomOrder: s.roomOrder.includes(room.id)
        ? s.roomOrder
        : [room.id, ...s.roomOrder],
    })),

  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),
});

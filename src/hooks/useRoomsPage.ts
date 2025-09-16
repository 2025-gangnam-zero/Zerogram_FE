import { useEffect, useState } from "react";
import {
  listMyJoinedRoomsApi,
  createRoomApi,
  deleteRoomApi,
} from "../api/room";
import { useRoomsStore } from "../store";

import { pickDefined, toClientRoom } from "../utils";
import type { ServerRoom, CreateRoomRequestDto } from "../types";

export function useRoomsPage(showToast: (m: string) => void) {
  const upsertRoom = useRoomsStore((s) => s.upsertRoom);
  const removeRoomFromStore = useRoomsStore((s) => s.removeRoom);

  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<ServerRoom[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { items } = await listMyJoinedRoomsApi({ limit: 50 });
        if (!mounted) return;
        setRooms(items as unknown as ServerRoom[]);
      } catch (e: any) {
        showToast(e?.message || "방 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      const { items } = await listMyJoinedRoomsApi({ limit: 50 });
      setRooms(items as unknown as ServerRoom[]);
    } catch (e: any) {
      showToast(e?.message || "목록 갱신 실패");
    } finally {
      setLoading(false);
    }
  };

  const create = async (form: {
    roomName: string;
    roomDescription?: string;
    roomImageUrl?: string;
    workoutType?: string;
    memberCapacity?: string;
  }) => {
    if (!form.roomName.trim()) {
      showToast("방 이름은 필수입니다.");
      return;
    }
    const body: CreateRoomRequestDto = pickDefined({
      roomName: form.roomName,
      roomDescription: form.roomDescription,
      roomImageUrl: form.roomImageUrl,
      workoutType: form.workoutType || undefined,
      memberCapacity:
        form.memberCapacity && form.memberCapacity.trim() !== ""
          ? Math.max(1, Number(form.memberCapacity))
          : undefined,
    }) as any;

    setSubmitting(true);
    try {
      const created = (await createRoomApi(body)) as unknown as ServerRoom;
      setRooms((prev) => [created, ...prev]);
      upsertRoom(toClientRoom(created));
      showToast("채팅방이 생성되었습니다.");
      return true;
    } catch (e: any) {
      showToast(e?.message || "채팅방 생성에 실패했습니다.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (roomId: string) => {
    const prev = rooms;
    setRooms((list) => list.filter((r) => r.id !== roomId)); // 낙관적
    try {
      await deleteRoomApi(roomId);
      removeRoomFromStore(roomId);
      showToast("삭제되었습니다.");
    } catch (e: any) {
      setRooms(prev); // 롤백
      showToast(e?.message || "삭제에 실패했습니다.");
    }
  };

  return { loading, rooms, submitting, refresh, create, remove };
}

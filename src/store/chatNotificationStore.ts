// src/store/notifications.ts
import { create } from "zustand";
import { ChatNotificationItem } from "../types";

type State = {
  items: ChatNotificationItem[]; // updatedAt DESC 정렬 유지

  /** 서버 리스트로 완전 치환 */
  setAll: (list: ChatNotificationItem[]) => void;

  /** 서버에서 단건 upsert(생성/갱신) 들어올 때 */
  upsert: (n: ChatNotificationItem) => void;

  /** 새 메시지 이벤트 반영(본인 메시지는 count 증가 제외할지 정책에 따라 조절) */
  bumpOnMessage: (payload: {
    roomId: string;
    lastMessageId: string;
    lastPreview?: string | null;
    self?: boolean; // 내가 보낸 메시지면 기본적으로 count 증가 X
    nowISO?: string; // 없으면 new Date().toISOString()
  }) => void;

  /** 특정 방 읽음 처리: count=0, status="read" */
  markRoomRead: (roomId: string) => void;

  /** 특정 방 알림 제거(혹은 상태만 cleared로) */
  clearRoom: (roomId: string, remove?: boolean) => void;

  /** 상태만 변경 (예: delivered 처리) */
  setStatus: (roomId: string, status: ChatNotificationItem["status"]) => void;

  /** 전체 미확인 합계 */
  totalUnreadCount: () => number;
};

const sortByUpdatedDesc = (arr: ChatNotificationItem[]) =>
  arr.slice().sort((a, b) => {
    const ta = Date.parse(a.updatedAt || "");
    const tb = Date.parse(b.updatedAt || "");
    return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
  });

export const useChatNotificationStore = create<State>((set, get) => ({
  items: [],

  setAll: (list) =>
    set({
      items: sortByUpdatedDesc(list),
    }),

  upsert: (n) =>
    set((s) => {
      const idx = s.items.findIndex(
        (it) => it.id === n.id || it.roomId === n.roomId
      );
      let next = s.items.slice();
      if (idx >= 0) {
        next[idx] = { ...next[idx], ...n };
      } else {
        next.unshift(n);
      }
      return { items: sortByUpdatedDesc(next) };
    }),

  bumpOnMessage: ({
    roomId,
    lastMessageId,
    lastPreview = null,
    self = false,
    nowISO,
  }) =>
    set((s) => {
      const now = nowISO ?? new Date().toISOString();
      const idx = s.items.findIndex((it) => it.roomId === roomId);
      // 본인 메시지는 일반적으로 count 증가 제외(정책에 맞춰 수정 가능)
      const inc = self ? 0 : 1;

      if (idx >= 0) {
        const cur = s.items[idx];
        const updated: ChatNotificationItem = {
          ...cur,
          lastMessageId,
          lastPreview,
          count: Math.max(0, (cur.count ?? 0) + inc),
          status: inc > 0 ? "queued" : cur.status, // 새 알림이면 queued
          updatedAt: now,
        };
        const next = s.items.slice();
        next[idx] = updated;
        return { items: sortByUpdatedDesc(next) };
      } else {
        // 기존 문서가 없으면 새로 생성(최소 필드)
        const created: ChatNotificationItem = {
          id: `${roomId}:${lastMessageId}:${now}`, // 서버에서 곧 실제 id 제공
          userId: "", // 서버 응답 시 채워짐
          roomId,
          lastMessageId,
          lastPreview,
          count: inc,
          status: inc > 0 ? "queued" : "delivered",
          createdAt: now,
          updatedAt: now,
        };
        return { items: sortByUpdatedDesc([created, ...s.items]) };
      }
    }),

  markRoomRead: (roomId) =>
    set((s) => {
      const idx = s.items.findIndex((it) => it.roomId === roomId);
      if (idx < 0) return s;
      const now = new Date().toISOString();
      const next = s.items.slice();
      next[idx] = {
        ...next[idx],
        count: 0,
        status: "read",
        updatedAt: now,
      };
      return { items: sortByUpdatedDesc(next) };
    }),

  clearRoom: (roomId, remove = false) =>
    set((s) => {
      const idx = s.items.findIndex((it) => it.roomId === roomId);
      if (idx < 0) return s;
      if (remove) {
        return { items: s.items.filter((it) => it.roomId !== roomId) };
      }
      const now = new Date().toISOString();
      const next = s.items.slice();
      next[idx] = {
        ...next[idx],
        count: 0,
        status: "cleared",
        updatedAt: now,
      };
      return { items: sortByUpdatedDesc(next) };
    }),

  setStatus: (roomId, status) =>
    set((s) => {
      const idx = s.items.findIndex((it) => it.roomId === roomId);
      if (idx < 0) return s;
      const now = new Date().toISOString();
      const next = s.items.slice();
      next[idx] = { ...next[idx], status, updatedAt: now };
      return { items: sortByUpdatedDesc(next) };
    }),

  totalUnreadCount: () =>
    get().items.reduce((sum, it) => sum + Math.max(0, it.count ?? 0), 0),
}));

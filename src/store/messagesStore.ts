import { create as createZ } from "zustand";
import type { ChatMessage } from "../types";

export type RoomMessages = {
  items: ChatMessage[]; // 오래된 → 최신 (seq ASC)
  nextBeforeId: string | null; // 과거 페이지 커서
};

export type MessagesState = {
  byRoomId: Record<string, RoomMessages>;
  lastSeenSeqByRoom: Record<string, number>;

  setPage: (
    roomId: string,
    page: { items: ChatMessage[]; nextBeforeId: string | null }
  ) => void;
  prependOlder: (
    roomId: string,
    older: { items: ChatMessage[]; nextBeforeId: string | null }
  ) => void;
  addMessage: (roomId: string, msg: ChatMessage) => void;
  updateMessage: (
    roomId: string,
    msgId: string,
    patch: Partial<ChatMessage>
  ) => void;
  removeMessage: (roomId: string, msgId: string) => void;
  clearRoom: (roomId: string) => void;
  replaceMessageId: (
    roomId: string,
    clientMessageId: string,
    serverId: string
  ) => void;
  markDelivered: (roomId: string, msgId: string) => void;
  markFailed: (roomId: string, msgId: string) => void;

  getLastSeenSeq(roomId: string): number;

  setLastSeenSeq(roomId: string, seq: number): void;
};

/** 안전한 시간 파싱 */
const ts = (iso?: string | null): number => {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
};

/** 정렬: seq ASC → createdAt ASC (보조) */
const cmpMsg = (a: ChatMessage, b: ChatMessage) => {
  if (a.seq !== b.seq) return a.seq - b.seq;
  return ts(a.createdAt) - ts(b.createdAt);
};

/** 배열 병합 + 중복 제거(id/seq) + 정렬 유지 */
const mergeDedupSort = (left: ChatMessage[], right: ChatMessage[]) => {
  if (right.length === 0) return left.slice();
  if (left.length === 0) return right.slice().sort(cmpMsg);

  const byId = new Map<string, ChatMessage>();
  const bySeq = new Map<number, string>(); // seq → id

  for (const m of left) {
    byId.set(m.id, m);
    bySeq.set(m.seq, m.id);
  }
  for (const m of right) {
    // 동일 seq가 이미 있고 id가 다르면(임시/서버 중복 등) → 서버(or 최신) 것으로 교체
    const existedId = bySeq.get(m.seq);
    if (existedId && existedId !== m.id) {
      byId.delete(existedId);
    }
    byId.set(m.id, m);
    bySeq.set(m.seq, m.id);
  }

  const merged = Array.from(byId.values());
  merged.sort(cmpMsg);
  return merged;
};

/** 단건 삽입(중복 방지 + 정렬 위치에 삽입) */
const insertOne = (arr: ChatMessage[], m: ChatMessage): ChatMessage[] => {
  // id 중복
  if (arr.find((x) => x.id === m.id)) return arr;
  // seq 중복(다른 id가 이미 같은 seq를 가짐) → 기존을 교체
  const idxSeq = arr.findIndex((x) => x.seq === m.seq);
  if (idxSeq >= 0) {
    const next = arr.slice();
    next[idxSeq] = m;
    next.sort(cmpMsg);
    return next;
  }
  // 이진 삽입(간단화: 선형 삽입도 충분하지만, 여기선 정렬 위치 계산)
  let lo = 0,
    hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cmpMsg(arr[mid], m) <= 0) lo = mid + 1;
    else hi = mid;
  }
  const next = arr.slice();
  next.splice(lo, 0, m);
  return next;
};

export const useMessagesStore = createZ<MessagesState>((set, get) => ({
  byRoomId: {},
  lastSeenSeqByRoom: {},

  /** 페이지 세팅(현재 뷰 기준의 최신쪽; 보통 최초 로드나 리프레시) */
  setPage: (roomId, page) =>
    set((st) => {
      const sorted = page.items.slice().sort(cmpMsg);
      return {
        byRoomId: {
          ...st.byRoomId,
          [roomId]: { items: sorted, nextBeforeId: page.nextBeforeId },
        },
      };
    }),

  /** 과거 페이지 프리펜드 */
  prependOlder: (roomId, older) =>
    set((st) => {
      const curr = st.byRoomId[roomId] ?? { items: [], nextBeforeId: null };
      const merged = mergeDedupSort(curr.items, older.items);
      return {
        byRoomId: {
          ...st.byRoomId,
          [roomId]: { items: merged, nextBeforeId: older.nextBeforeId },
        },
      };
    }),

  /** 새 메시지 추가(보통 타임라인 맨 끝으로 들어가지만 seq 기준 위치 삽입) */
  addMessage: (roomId, msg) =>
    set((st) => {
      const curr = st.byRoomId[roomId] ?? { items: [], nextBeforeId: null };
      const nextItems = insertOne(curr.items, msg);
      // 이미 동일 id/seq가 있는 경우 변화 없음
      if (nextItems === curr.items) return st;
      return {
        byRoomId: {
          ...st.byRoomId,
          [roomId]: { ...curr, items: nextItems },
        },
      };
    }),

  /** 메시지 부분 업데이트(편집/딜리버리 플래그 등) */
  updateMessage: (roomId, msgId, patch) =>
    set((st) => {
      const curr = st.byRoomId[roomId];
      if (!curr) return st;

      // seq가 변경될 일은 거의 없지만(임시→서버 교체는 별도 처리), 혹시 모를 변경을 고려해 재정렬
      const nextItems = curr.items.map((m) =>
        m.id === msgId ? { ...m, ...patch } : m
      );
      nextItems.sort(cmpMsg);

      return {
        byRoomId: {
          ...st.byRoomId,
          [roomId]: { ...curr, items: nextItems },
        },
      };
    }),

  /** 메시지 제거 */
  removeMessage: (roomId, msgId) =>
    set((st) => {
      const curr = st.byRoomId[roomId];
      if (!curr) return st;
      const nextItems = curr.items.filter((m) => m.id !== msgId);
      if (nextItems.length === curr.items.length) return st;
      return {
        byRoomId: {
          ...st.byRoomId,
          [roomId]: { ...curr, items: nextItems },
        },
      };
    }),

  /** 방별 메시지 초기화(나가기 등) */
  clearRoom: (roomId) =>
    set((st) => {
      if (!st.byRoomId[roomId]) return st;
      const cloned = { ...st.byRoomId };
      delete cloned[roomId];
      return { byRoomId: cloned };
    }),

  /** 임시 ID → 서버 ID 교체
   *  - 서버 메시지가 이미 도착해 같은 seq(또는 id)로 존재하면 임시 메시지 제거만 수행
   */
  replaceMessageId: (roomId, clientMessageId, serverId) =>
    set((st) => {
      const curr = st.byRoomId[roomId];
      if (!curr) return st;

      const temp = curr.items.find((m) => m.id === clientMessageId);
      if (!temp) return st;

      // 서버 메시지가 이미 존재하는가?
      const serverIdx = curr.items.findIndex(
        (m) => m.id === serverId || m.seq === temp.seq
      );
      if (serverIdx >= 0) {
        // 이미 서버본이 있으므로 임시본만 제거
        const nextItems = curr.items.filter((m) => m.id !== clientMessageId);
        return {
          byRoomId: {
            ...st.byRoomId,
            [roomId]: { ...curr, items: nextItems },
          },
        };
      }

      // 서버본이 아직 없다면, 임시 항목의 id/상태만 교체
      const nextItems = curr.items.map((m) =>
        m.id === clientMessageId
          ? { ...m, id: serverId, pending: false, failed: false }
          : m
      );
      nextItems.sort(cmpMsg);

      return {
        byRoomId: {
          ...st.byRoomId,
          [roomId]: { ...curr, items: nextItems },
        },
      };
    }),

  markDelivered: (roomId, msgId) =>
    get().updateMessage(roomId, msgId, { pending: false, failed: false }),

  markFailed: (roomId, msgId) =>
    get().updateMessage(roomId, msgId, { pending: false, failed: true }),

  getLastSeenSeq: (roomId) => {
    const m = get().lastSeenSeqByRoom[roomId];
    return typeof m === "number" ? m : 0;
  },

  setLastSeenSeq: (roomId, seq) =>
    set((st) => {
      const prev = st.lastSeenSeqByRoom[roomId] ?? 0;
      if (seq <= prev) return st; // 단조증가 보장
      return {
        lastSeenSeqByRoom: { ...st.lastSeenSeqByRoom, [roomId]: seq },
      };
    }),
}));

import { ChatMessage } from "../../types";

/** 서버 응답 정렬(혼재 가능성)을 안전하게 오름차순으로 맞춥니다. */
export function normalizeAscending(items: ChatMessage[]): ChatMessage[] {
  if (!items?.length) return [];
  return [...items].sort((a, b) => {
    const sa =
      (a as any).seq ?? (a as any).createdAtIso ?? (a as any).createdAt ?? 0;
    const sb =
      (b as any).seq ?? (b as any).createdAtIso ?? (b as any).createdAt ?? 0;

    const ta = typeof sa === "number" ? sa : new Date(sa).getTime();
    const tb = typeof sb === "number" ? sb : new Date(sb).getTime();
    return ta - tb; // 오래 → 새로
  });
}

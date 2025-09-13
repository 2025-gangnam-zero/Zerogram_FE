// utils/readReceipts.ts
import type { Message, RoomMember } from "../types/chat";

// 개행/공백 정리
export const sanitizePreview = (s: string): string =>
  s.replace(/\s+/g, " ").trim();

// 글자수 제한
export const truncate = (s: string, max = 40): string =>
  s.length > max ? `${s.slice(0, max)}…` : s;

// 상대 시간 (초/분/시간/일, 이후엔 날짜)
export const formatRelativeTime = (ts: number): string => {
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return `${diffSec}초 전`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  return new Date(ts).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
};

// 리스트 미리보기 문자열 생성
type PreviewOpts = { showAuthor?: boolean; maxLen?: number };

export const formatLastMessagePreview = (
  last?: import("../types/chat").LastMessage,
  meId?: string,
  opts: PreviewOpts = { showAuthor: false, maxLen: 40 }
): string => {
  if (!last) return "메시지가 없습니다.";
  if (last.deleted) return "삭제된 메시지";

  const authorPrefix =
    opts.showAuthor && last.author?.name
      ? `${last.author.id === meId ? "나" : last.author.name}: `
      : "";

  const maxLen = opts.maxLen ?? 40;

  switch (last.type) {
    case "text": {
      const text = sanitizePreview(last.text ?? "");
      return authorPrefix + (text ? truncate(text, maxLen) : "(내용 없음)");
    }
    case "system": {
      const text = sanitizePreview(last.text ?? "");
      return text ? truncate(text, maxLen) : "시스템 메시지";
    }
    case "image": {
      const count =
        last.attachments?.filter((a) => a.kind === "image").length ?? 1;
      return `${authorPrefix}🖼️ 이미지 ${count}장`;
    }
    case "video": {
      const count =
        last.attachments?.filter((a) => a.kind === "video").length ?? 1;
      return `${authorPrefix}🎬 동영상 ${count}개`;
    }
    case "audio": {
      const count =
        last.attachments?.filter((a) => a.kind === "audio").length ?? 1;
      return `${authorPrefix}🎧 음성메시지 ${count}개`;
    }
    case "file": {
      const firstName = last.attachments?.[0]?.name;
      const count = last.attachments?.length ?? 1;
      return `${authorPrefix}📎 ${
        firstName ? truncate(firstName, maxLen) : "파일"
      }${count > 1 ? ` 외 ${count - 1}` : ""}`;
    }
    case "sticker": {
      return `${authorPrefix}😊 스티커`;
    }
    default:
      return authorPrefix + "메시지";
  }
};

export const isMemberAt = (m: RoomMember, at: number): boolean =>
  m.joinedAt <= at && (m.leftAt == null || m.leftAt > at);

type ComputeOpts = {
  includeAuthor?: boolean; // 기본 false
  excludeBots?: boolean; // 기본 true
};

export const computeUnreadCount = (
  message: Message,
  members: RoomMember[],
  opts: ComputeOpts = { includeAuthor: false, excludeBots: true }
): number => {
  const { includeAuthor = false, excludeBots = true } = opts;

  const eligible = members.filter((mem) => {
    if (excludeBots && mem.isBot) return false;
    if (!isMemberAt(mem, message.createdAt)) return false;
    if (!includeAuthor && mem.user.id === message.authorId) return false;
    return true;
  });

  const unread = eligible.filter((mem) => {
    const lastRead = mem.lastReadAt ?? 0;
    return lastRead < message.createdAt;
  });

  return unread.length;
};

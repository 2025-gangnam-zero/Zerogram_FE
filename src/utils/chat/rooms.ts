import { ChatMessage, SidebarListItemData } from "../../types";

const isImage = (t?: string) => !!t && t.startsWith("image/");
const isVideo = (t?: string) => !!t && t.startsWith("video/");

export const pickRoomPreview = (msg: ChatMessage): string => {
  if (msg.text && msg.text.trim()) return msg.text;

  const types = msg.attachments?.map((a) => a.contentType ?? "") ?? [];
  const hasImage = types.some(isImage);
  const hasVideo = types.some(isVideo);

  if (hasImage && hasVideo) return "사진·동영상";
  if (hasImage) return "사진";
  if (hasVideo) return "동영상";
  return msg.attachments && msg.attachments.length > 0 ? "첨부 파일" : "";
};

export const applyIncomingMessageToRooms = (
  rooms: SidebarListItemData[],
  msg: ChatMessage
): SidebarListItemData[] => {
  const preview = pickRoomPreview(msg);
  const idx = rooms.findIndex((r) => r.id === msg.roomId);

  // 목록 복제
  const next = rooms.slice();

  if (idx >= 0) {
    // 기존 방: 마지막 메시지/시간만 갱신
    next[idx] = {
      ...next[idx],
      lastMessage: preview || next[idx].lastMessage,
      lastMessageAt: msg.createdAt, // 서버가 ISO로 주는 createdAt 사용
      // unreadCount는 알림 붙일 때 처리(지금은 건드리지 않음)
    };
  } else {
    // 목록에 없던 방: 최소 정보로 추가(이름은 서버에서 내려오면 교체)
    next.unshift({
      id: msg.roomId,
      roomName: `방 ${msg.roomId}`,
      lastMessage: preview,
      lastMessageAt: msg.createdAt,
      unreadCount: 1, // 선택(당장은 안 써도 됨)
    });
  }

  // 정렬: lastMessageAt DESC (없으면 0으로 간주)
  next.sort((a, b) => {
    const ta = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
    const tb = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
    return tb - ta;
  });

  return next;
};

export function bumpUnreadAndSort(
  rooms: SidebarListItemData[],
  msg: ChatMessage,
  opts: { currentRoomId?: string; myUserId?: string; loopPin?: boolean } = {}
): SidebarListItemData[] {
  const { currentRoomId, myUserId } = opts;

  // 내 메시지이거나 현재 보고 있는 방이면 unread 증가 X
  const shouldBump = msg.roomId !== currentRoomId && msg.authorId !== myUserId;

  const next = rooms.slice();
  const i = next.findIndex((r) => r.id === msg.roomId);
  const preview = (() => {
    if (msg.text && msg.text.trim()) return msg.text;
    const types = msg.attachments?.map((a) => a.contentType ?? "") ?? [];
    const hasImage = types.some((t) => t.startsWith("image/"));
    const hasVideo = types.some((t) => t.startsWith("video/"));
    if (hasImage && hasVideo) return "사진·동영상";
    if (hasImage) return "사진";
    if (hasVideo) return "동영상";
    return (msg.attachments?.length ?? 0) > 0 ? "첨부 파일" : "";
  })();

  if (i >= 0) {
    const prev = next[i];
    next[i] = {
      ...prev,
      lastMessage: preview || prev.lastMessage,
      lastMessageAt: msg.createdAt,
      unreadCount: shouldBump ? (prev.unreadCount ?? 0) + 1 : prev.unreadCount,
    };
  } else {
    // 목록에 없던 방 → 최소 메타로 추가 (선택)
    next.unshift({
      id: msg.roomId,
      roomName: `방 ${msg.roomId}`,
      lastMessage: preview,
      lastMessageAt: msg.createdAt,
      unreadCount: shouldBump ? 1 : 0,
    });
  }

  next.sort((a, b) => {
    const ta = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
    const tb = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
    return tb - ta;
  });

  return next;
}

/** 방을 열었을 때(읽음 처리) 사이드바 배지 0으로 */
export const clearUnread = (list: SidebarListItemData[], roomId: string) => {
  if (!roomId) return list; // 방어
  let changed = false;
  const next = list.map((it) => {
    if (it.id !== roomId) return it;
    if (!it.unreadCount || it.unreadCount === 0) return it;
    changed = true;
    return { ...it, unreadCount: 0 };
  });
  return changed ? next : list; // 참조 보존 최적화
};

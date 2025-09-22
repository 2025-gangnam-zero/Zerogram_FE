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

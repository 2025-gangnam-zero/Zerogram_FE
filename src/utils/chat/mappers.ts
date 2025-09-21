import { ChatMessage, ChatMessageDTO } from "../../types";

export const toChatMessage = (dto: ChatMessageDTO): ChatMessage => ({
  id: dto.id,
  serverId: dto.serverId,
  roomId: dto.roomId,
  authorId: dto.authorId,
  author: dto.author,
  text: dto.text,
  attachments: dto.attachments,
  seq: dto.seq,
  createdAt: dto.createdAtIso,
  meta: dto.meta,
});

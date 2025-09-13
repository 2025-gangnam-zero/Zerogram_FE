import { useChatStore } from "./chatStore";
import { rooms, mockMessages } from "../data/data"; // 네가 쓰는 경로에 맞춰 조정
import type { Message } from "../types/chat";

type BootstrapOpts = {
  meId: string; // 현재 사용자 id (user 스토어에서 가져와 전달)
  activeRoomId?: string; // 초기 활성 방 (없으면 첫 방)
};

export const bootstrapChat = ({ meId, activeRoomId }: BootstrapOpts) => {
  const {
    setRooms,
    setMembers,
    setInitialMessages,
    setLastReadAt,
    setRoomUnread,
    setActiveRoom,
  } = useChatStore.getState();

  // 1) 방 메타 주입
  setRooms(rooms);

  // 2) 각 방에 멤버/메시지/읽음 상태 주입
  rooms.forEach((room) => {
    // (옵션) 멤버 배열이 있으면 주입
    if (room.members) {
      setMembers(room.id, room.members);
    }

    // 메시지 주입 (unreadOthers가 없다면 0으로 방어)
    const msgs: Message[] = mockMessages[room.id] ?? [];
    setInitialMessages(room.id, msgs);

    // 내 마지막 읽은 시각(lastReadAt)과 방 레벨 미읽음 수 계산
    const myMember = room.members?.find((m) => m.user.id === meId);
    const myLastRead = myMember?.lastReadAt ?? 0;
    setLastReadAt(room.id, myLastRead);

    const roomUnread = msgs.reduce(
      (acc, m) => acc + (m.createdAt > myLastRead ? 1 : 0),
      0
    );
    setRoomUnread(room.id, roomUnread);
  });

  // 3) 초기 활성 방 설정
  setActiveRoom(activeRoomId ?? rooms[0]?.id);
};

// 스토어를 깔끔히 비우고 싶을 때(테스트/로그아웃 등)
export const resetChatStore = () => {
  const initial = useChatStore.getState();
  // 필요한 키만 초기화(간단 버전)
  useChatStore.setState({
    roomsById: {},
    roomOrder: [],
    activeRoomId: undefined,
    membersByRoomId: {},
    messagesById: {},
    messageIdsByRoomId: {},
    beforeCursorByRoomId: {},
    lastReadAtByRoom: {},
    unreadCountByRoom: {},
    draftByRoomId: {},
    isDndDragging: false,
    // 셀렉터 함수(selectThreads 등)는 그대로 유지됨
  } as any);
};

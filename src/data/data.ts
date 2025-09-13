// src/data/data.ts
import type {
  CHThread,
  Message,
  Sender,
  Room,
  RoomMember,
  LastMessage,
} from "../types/chat";

/** ===== 공용 유틸 ===== */
const now = Date.now();
const days = (n: number) => n * 24 * 60 * 60 * 1000;

/** 최신 메시지 선택 */
const pickLatest = (arr: Message[] | undefined): Message | undefined =>
  arr && arr.length
    ? arr.reduce((a, b) => (a.createdAt > b.createdAt ? a : b))
    : undefined;

/** Message -> LastMessage (literal 보장) */
export const toLastMessage = (m: Message): LastMessage => ({
  id: m.id,
  author: { id: m.authorId, name: m.authorName },
  type: "text", // ✅ literal로 고정
  text: m.content,
  createdAt: m.createdAt,
});

/** ===== 사용자 ===== */
export const me: Sender = {
  id: "me",
  name: "박나라",
  avatarUrl: "https://avatars.githubusercontent.com/u/9919?v=4",
};

export const users: Sender[] = [
  me,
  { id: "u1", name: "승언", avatarUrl: "https://i.pravatar.cc/100?img=12" },
  {
    id: "u2",
    name: "웹개발팀_김한철",
    avatarUrl: "https://i.pravatar.cc/100?img=23",
  },
  {
    id: "u3",
    name: "Seraaaiing",
    avatarUrl: "https://i.pravatar.cc/100?img=45",
  },
];

/** ===== 방 멤버 (RoomMember) 목데이터 ===== */
const m = (
  user: Sender,
  joinedOffsetDays: number,
  lastReadMsAgo: number,
  extra?: Partial<RoomMember>
): RoomMember => ({
  user: { id: user.id, name: user.name, avatarUrl: user.avatarUrl },
  joinedAt: now - days(joinedOffsetDays),
  lastReadAt: now - lastReadMsAgo,
  ...extra,
});

/** ===== 방(Room) =====
 * memberCount: 리스트/헤더용 캐시 숫자
 * members: 상세/읽음 계산용 (옵션)
 */
export const rooms: Room[] = [
  {
    id: "room-1",
    roomName: "프로젝트 A",
    roomImageUrl: "https://placehold.co/48x48?text=A",
    memberCount: 3,
    members: [
      m(users[1], 30, 3_500_000), // u1
      m(me, 30, 2_000_000), // me
      m(users[2], 20, 8_000_000), // u2
    ],
  },
  {
    id: "room-2",
    roomName: "프론트엔드 스터디",
    roomImageUrl: "https://placehold.co/48x48?text=FE",
    memberCount: 4,
    members: [
      m(users[2], 40, 7_300_000), // u2
      m(users[3], 15, 7_100_000), // u3
      m(me, 15, 7_200_000), // me
      m(users[1], 1, 7_000_000), // u1
    ],
  },
  {
    id: "room-3",
    roomName: "백엔드 모임",
    roomImageUrl: "https://placehold.co/48x48?text=BE",
    memberCount: 2,
    members: [
      m(users[3], 5, 10_700_000), // u3
      m(me, 5, 10_600_000), // me
    ],
  },
];

/** ===== 메시지 ===== */
export const mockMessages: Record<string, Message[]> = {
  "room-1": [
    {
      id: "m1",
      authorId: "u1",
      authorName: "승언",
      authorAvatarUrl: users[1].avatarUrl,
      content: "오늘 회의는 4시에 시작합니다.",
      createdAt: now - 3_600_000,
    },
    {
      id: "m2",
      authorId: "me",
      authorName: "박나라",
      authorAvatarUrl: me.avatarUrl,
      content: "확인했습니다 👍",
      createdAt: now - 3_400_000,
    },
  ],
  "room-2": [
    {
      id: "m3",
      authorId: "u2",
      authorName: "웹개발팀_김한철",
      authorAvatarUrl: users[2].avatarUrl,
      content: "리액트 훅스 공부는 어디까지 하셨나요?",
      createdAt: now - 7_200_000,
    },
  ],
  "room-3": [
    {
      id: "m4",
      authorId: "u3",
      authorName: "Seraaaiing",
      authorAvatarUrl: users[3].avatarUrl,
      content: "API 서버 배포 완료했습니다!",
      createdAt: now - 10_800_000,
    },
  ],
};

/** ===== 스레드(CHThread) ===== */
export const mockThreads: CHThread[] = rooms.map((room) => {
  const latest = pickLatest(mockMessages[room.id]);
  return {
    id: room.id,
    room,
    lastMessage: latest ? toLastMessage(latest) : undefined,
    unreadCount: 0, // 필요 시 계산 로직 연결
  };
});

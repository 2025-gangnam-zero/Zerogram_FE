import { SidebarListItemData } from "../../types";

export const mineRooms: SidebarListItemData[] = [
  {
    id: "r-101",
    roomName: "헬스 크루",
    imageUrl: "https://placehold.co/40x40?text=H",
    memberCount: 24,
    lastMessage: "내일 7시에 만나요!",
    lastMessageAt: "2025-09-18T21:05:00+09:00",
    unreadCount: 2,
  },
  {
    id: "r-102",
    roomName: "러닝 소모임",
    imageUrl: "https://placehold.co/40x40?text=R",
    memberCount: 18,
    lastMessage: "한강 5km 러닝",
    lastMessageAt: "2025-09-18T20:40:00+09:00",
    unreadCount: 0,
  },
  {
    id: "r-103",
    roomName: "PT 회원방",
    imageUrl: "https://placehold.co/40x40?text=PT",
    memberCount: 9,
    lastMessage: "오늘 등운동 루틴 공유",
    lastMessageAt: "2025-09-18T19:15:00+09:00",
    // unreadCount 생략 가능
  },
];

export const publicRooms: SidebarListItemData[] = [
  {
    id: "p-201",
    roomName: "서울 러너스",
    imageUrl: "https://placehold.co/40x40?text=SR",
    memberCount: 132,
  },
  {
    id: "p-202",
    roomName: "홈트 입문",
    imageUrl: "https://placehold.co/40x40?text=HT",
    memberCount: 87,
  },
  {
    id: "p-203",
    roomName: "자전거 동호회",
    imageUrl: "https://placehold.co/40x40?text=BI",
    memberCount: 54,
  },
  {
    id: "p-204",
    roomName: "식단 레시피",
    imageUrl: "https://placehold.co/40x40?text=FO",
    memberCount: 210,
  },
];

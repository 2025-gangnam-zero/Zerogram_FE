import type { ChatMessage, ChatUser } from "../../types";

// 현재 로그인 사용자 (예시)
export const CURRENT_USER: ChatUser = {
  userId: "u-001",
  nickname: "나",
  // profile_image: ""  // 필요 시 추가
};

/**
 * 방별(mock) 메시지
 * 키는 roomId (r-101, p-201 등)
 */
export const chatMessagesByRoomId: Record<string, ChatMessage[]> = {
  // ============ 내 채팅 ============
  "r-101": [
    {
      id: "m-r101-1",
      roomId: "r-101",
      text: "내일 7시에 만나요!",
      createdAt: "2025-09-18T19:05:00+09:00",
      author: {
        userId: "u-010",
        nickname: "트레이너 J",
        profile_image: "https://placehold.co/40x40?text=J",
      },
      meta: { readCount: 2 },
    },
    {
      id: "m-r101-2",
      roomId: "r-101",
      text: "헬스장 입구에서 모이죠?",
      createdAt: "2025-09-18T19:07:00+09:00",
      author: CURRENT_USER,
      meta: { readCount: 2 },
    },
    {
      id: "m-r101-3",
      roomId: "r-101",
      text: "네! 워밍업 10분 먼저 할게요.",
      createdAt: "2025-09-18T19:08:00+09:00",
      author: {
        userId: "u-011",
        nickname: "민지",
        profile_image: "https://placehold.co/40x40?text=M",
      },
      meta: { readCount: 2 },
    },
  ],

  "r-102": [
    {
      id: "m-r102-1",
      roomId: "r-102",
      text: "이번 주 한강 5km 러닝 어떠세요?",
      createdAt: "2025-09-17T21:10:00+09:00",
      author: {
        userId: "u-020",
        nickname: "김러너",
        profile_image: "https://placehold.co/40x40?text=R",
      },
      meta: { readCount: 2 },
    },
    {
      id: "m-r102-2",
      roomId: "r-102",
      text: "저 참여요! 8시에 가능해요.",
      createdAt: "2025-09-17T21:12:00+09:00",
      author: CURRENT_USER,
      meta: { readCount: 1 },
    },
    {
      id: "m-r102-3",
      roomId: "r-102",
      text: "좋아요. 잠실대교 남단 집결!",
      createdAt: "2025-09-17T21:15:00+09:00",
      author: {
        userId: "u-021",
        nickname: "호준",
        profile_image: "https://placehold.co/40x40?text=H",
      },
      meta: { readCount: 0 },
    },
  ],

  "r-103": [
    {
      id: "m-r103-1",
      roomId: "r-103",
      text: "오늘 등 운동 순서: 렛풀다운 → 바벨로우 → 시티드로우",
      createdAt: "2025-09-16T18:30:00+09:00",
      author: {
        userId: "u-030",
        nickname: "코치 P",
        profile_image: "https://placehold.co/40x40?text=P",
      },
    },
    {
      id: "m-r103-2",
      roomId: "r-103",
      text: "세트/반복 수 어떻게 갈까요?",
      createdAt: "2025-09-16T18:32:00+09:00",
      author: CURRENT_USER,
      meta: { readCount: 3 },
    },
    {
      id: "m-r103-3",
      roomId: "r-103",
      text: "각 4세트, 12-10-8-6 반복으로 진행해요.",
      createdAt: "2025-09-16T18:33:00+09:00",
      author: {
        userId: "u-030",
        nickname: "코치 P",
        profile_image: "https://placehold.co/40x40?text=P",
      },
    },
  ],

  // ============ 공개 채팅 ============
  "p-201": [
    {
      id: "m-p201-1",
      roomId: "p-201",
      text: "주말 번개 러닝 모집합니다. 페이스 6’00”",
      createdAt: "2025-09-15T09:10:00+09:00",
      author: {
        userId: "u-201",
        nickname: "서울 러너스 운영자",
        profile_image: "https://placehold.co/40x40?text=SR",
      },
    },
    {
      id: "m-p201-2",
      roomId: "p-201",
      text: "신청은 여기 댓글로 남겨주세요!",
      createdAt: "2025-09-15T09:12:00+09:00",
      author: {
        userId: "u-201",
        nickname: "서울 러너스 운영자",
        profile_image: "https://placehold.co/40x40?text=SR",
      },
    },
    {
      id: "m-p201-3",
      roomId: "p-201",
      text: "참여합니다 🙋‍♂️",
      createdAt: "2025-09-15T09:20:00+09:00",
      author: CURRENT_USER,
    },
  ],

  "p-202": [
    {
      id: "m-p202-1",
      roomId: "p-202",
      text: "오늘의 홈트: 스쿼트 20×3, 플랭크 45초×3",
      createdAt: "2025-09-14T08:00:00+09:00",
      author: {
        userId: "u-202",
        nickname: "홈트봇",
        profile_image: "https://placehold.co/40x40?text=HT",
      },
    },
    {
      id: "m-p202-2",
      roomId: "p-202",
      text: "초보는 세트당 15회로 조절해도 좋아요.",
      createdAt: "2025-09-14T08:02:00+09:00",
      author: {
        userId: "u-202",
        nickname: "홈트봇",
        profile_image: "https://placehold.co/40x40?text=HT",
      },
    },
    {
      id: "m-p202-3",
      roomId: "p-202",
      text: "오늘부터 도전해볼게요!",
      createdAt: "2025-09-14T08:10:00+09:00",
      author: CURRENT_USER,
    },
  ],

  "p-203": [
    {
      id: "m-p203-1",
      roomId: "p-203",
      text: "이번 주말 북한강 라이드 코스 공유합니다.",
      createdAt: "2025-09-13T11:05:00+09:00",
      author: {
        userId: "u-203",
        nickname: "로드킹",
        profile_image: "https://placehold.co/40x40?text=BI",
      },
    },
    {
      id: "m-p203-2",
      roomId: "p-203",
      text: "고도 600m, 총 70km 예정입니다.",
      createdAt: "2025-09-13T11:07:00+09:00",
      author: {
        userId: "u-203",
        nickname: "로드킹",
        profile_image: "https://placehold.co/40x40?text=BI",
      },
    },
    {
      id: "m-p203-3",
      roomId: "p-203",
      text: "초보도 가능한가요?",
      createdAt: "2025-09-13T11:10:00+09:00",
      author: CURRENT_USER,
    },
  ],

  "p-204": [
    {
      id: "m-p204-1",
      roomId: "p-204",
      text: "고단백 저지방 식단 레시피 공유해요: 닭가슴살 스테이크 + 샐러드",
      createdAt: "2025-09-12T12:20:00+09:00",
      author: {
        userId: "u-204",
        nickname: "다이어트셰프",
        profile_image: "https://placehold.co/40x40?text=FO",
      },
    },
    {
      id: "m-p204-2",
      roomId: "p-204",
      text: "소스는 요거트+레몬즙이면 맛있습니다!",
      createdAt: "2025-09-12T12:23:00+09:00",
      author: {
        userId: "u-204",
        nickname: "다이어트셰프",
        profile_image: "https://placehold.co/40x40?text=FO",
      },
    },
    {
      id: "m-p204-3",
      roomId: "p-204",
      text: "주말에 해볼게요 👍",
      createdAt: "2025-09-12T12:30:00+09:00",
      author: CURRENT_USER,
    },
  ],
};

import { ChatroomListItem, MessagesByRoom } from "../types";

export const mockItems: ChatroomListItem[] = [
  {
    id: "room-1",
    roomName: "헬스장 친구들",
    roomImageUrl: "https://placehold.co/40x40/FF5733/FFFFFF?text=GYM",
    memberCount: 45,
    memberCapacity: 50,
    lastMessage: "오늘은 스쿼트 100kg 성공했습니다🔥",
    lastMessageAt: "오전 8:30",
    unreadCount: 2,
    isPinned: true,
    workoutType: "fitness",
    roomDescription: "매일 헬스 인증하고 운동 루틴 공유하는 방입니다.",
  },
  {
    id: "room-2",
    roomName: "러닝 크루",
    roomImageUrl: "https://placehold.co/40x40/33C1FF/FFFFFF?text=RUN",
    memberCount: 128,
    memberCapacity: 200,
    lastMessage: "내일 새벽 6시에 한강에서 뛰실 분?",
    lastMessageAt: "어제",
    unreadCount: 10,
    isPinned: false,
    workoutType: "running",
    roomDescription: "주말마다 함께 뛰는 러닝 모임입니다.",
  },
  {
    id: "room-3",
    roomName: "홈트 챌린지",
    roomImageUrl: "https://placehold.co/40x40/28A745/FFFFFF?text=HT",
    memberCount: 78,
    memberCapacity: 100,
    lastMessage: "플랭크 챌린지 3일차 완료했어요 💪",
    lastMessageAt: "오후 9:12",
    unreadCount: 0,
    isPinned: false,
    workoutType: "fitness",
    roomDescription: "집에서 하는 홈트 챌린지를 함께 이어가는 방입니다.",
  },
  {
    id: "room-4",
    roomName: "요가 & 명상",
    roomImageUrl: "https://placehold.co/40x40/FFC300/FFFFFF?text=YOGA",
    memberCount: 56,
    memberCapacity: 80,
    lastMessage: "오늘은 호흡 명상 10분 해보는 거 어때요?",
    lastMessageAt: "오전 6:45",
    unreadCount: 4,
    isPinned: false,
    workoutType: "fitness",
    roomDescription: "요가와 명상으로 하루를 정리하는 방입니다.",
  },
  {
    id: "room-5",
    roomName: "크로스핏 열정단",
    roomImageUrl: "https://placehold.co/40x40/900C3F/FFFFFF?text=CF",
    memberCount: 34,
    memberCapacity: 60,
    lastMessage: "이번 주 WOD(Workout of the Day) 공유합니다!",
    lastMessageAt: "3일 전",
    unreadCount: 15,
    isPinned: true,
    workoutType: "fitness",
    roomDescription: "크로스핏 운동 기록과 팁을 공유하는 방입니다.",
  },
];

export const mockMessages: MessagesByRoom = {
  "room-1": [
    {
      id: "msg-1",
      roomId: "room-1",
      author: {
        id: "u1",
        name: "철수",
        avatarUrl: "https://placehold.co/32x32/FF5733/FFFFFF?text=C",
      },
      content: "오늘 벤치프레스 80kg 성공했어!",
      createdAt: "오전 8:10",
      unreadByCount: 3,
    },
    {
      id: "msg-2",
      roomId: "room-1",
      author: {
        id: "me",
        name: "나",
        avatarUrl: "https://placehold.co/32x32/000000/FFFFFF?text=ME",
      },
      content:
        "벤치 자세 참고 영상 공유할게요 https://www.youtube.com/watch?v=gRVjAtPip0Y",
      createdAt: "오전 8:12",
      isMine: true,
      unreadByCount: 2,
    },
    {
      id: "msg-3",
      roomId: "room-1",
      author: {
        id: "u2",
        name: "영희",
        avatarUrl: "https://placehold.co/32x32/33C1FF/FFFFFF?text=Y",
      },
      images: ["https://placehold.co/200x150/FF5733/FFFFFF?text=스쿼트+사진"],
      createdAt: "오전 8:20",
    },
  ],

  "room-2": [
    {
      id: "msg-4",
      roomId: "room-2",
      author: {
        id: "u2",
        name: "영희",
        avatarUrl: "https://placehold.co/32x32/33C1FF/FFFFFF?text=Y",
      },
      content:
        "내일 새벽 6시에 뛸 사람 있나요? 코스 참고: https://www.youtube.com/watch?v=8V0HETilrEw",
      createdAt: "어제 오후 10:05",
    },
    {
      id: "msg-5",
      roomId: "room-2",
      author: {
        id: "me",
        name: "나",
        avatarUrl: "https://placehold.co/32x32/000000/FFFFFF?text=ME",
      },
      content: "저 참여할게요! 🏃‍♂️",
      createdAt: "어제 오후 10:07",
      isMine: true,
    },
    {
      id: "msg-6",
      roomId: "room-2",
      author: {
        id: "u3",
        name: "민수",
        avatarUrl: "https://placehold.co/32x32/28A745/FFFFFF?text=M",
      },
      images: [
        "https://placehold.co/300x200/33C1FF/FFFFFF?text=러닝사진1",
        "https://placehold.co/300x200/33C1FF/FFFFFF?text=러닝사진2",
      ],
      createdAt: "어제 오후 10:15",
    },
  ],

  "room-3": [
    {
      id: "msg-7",
      roomId: "room-3",
      author: {
        id: "u3",
        name: "민수",
        avatarUrl: "https://placehold.co/32x32/28A745/FFFFFF?text=M",
      },
      content:
        "플랭크 팁 글 좋아서 공유합니다 https://velog.io/@someone/plank-tips",
      createdAt: "어제 오후 9:15",
    },
    {
      id: "msg-8",
      roomId: "room-3",
      author: {
        id: "me",
        name: "나",
        avatarUrl: "https://placehold.co/32x32/000000/FFFFFF?text=ME",
      },
      content: "저는 2분에서 실패했어요 😅",
      createdAt: "어제 오후 9:20",
      isMine: true,
    },
  ],

  "room-4": [
    {
      id: "msg-9",
      roomId: "room-4",
      author: {
        id: "u4",
        name: "수진",
        avatarUrl: "https://placehold.co/32x32/FFC300/FFFFFF?text=S",
      },
      // 텍스트 없이 링크만 → 말풍선 없이 카드만 보이도록
      content: "https://www.youtube.com/watch?v=inpok4MKVLM",
      createdAt: "오늘 오전 6:50",
    },
    {
      id: "msg-10",
      roomId: "room-4",
      author: {
        id: "me",
        name: "나",
        avatarUrl: "https://placehold.co/32x32/000000/FFFFFF?text=ME",
      },
      images: ["https://placehold.co/200x200/FFC300/FFFFFF?text=요가포즈"],
      createdAt: "오늘 오전 7:10",
      isMine: true,
    },
  ],

  "room-5": [
    {
      id: "msg-11",
      roomId: "room-5",
      author: {
        id: "u5",
        name: "준호",
        avatarUrl: "https://placehold.co/32x32/900C3F/FFFFFF?text=J",
      },
      content:
        "오늘 WOD: 버피 50개 + 데드리프트 5세트 참고 링크 https://www.crossfit.com/workout",
      createdAt: "3일 전 오후 6:00",
    },
    {
      id: "msg-12",
      roomId: "room-5",
      author: {
        id: "me",
        name: "나",
        avatarUrl: "https://placehold.co/32x32/000000/FFFFFF?text=ME",
      },
      content: "와 오늘은 진짜 빡세네요...🔥",
      createdAt: "3일 전 오후 6:05",
      isMine: true,
    },
    {
      id: "msg-13",
      roomId: "room-5",
      author: {
        id: "u6",
        name: "지현",
        avatarUrl: "https://placehold.co/32x32/FF00FF/FFFFFF?text=JH",
      },
      images: [
        "https://placehold.co/250x150/900C3F/FFFFFF?text=크로스핏1",
        "https://placehold.co/250x150/900C3F/FFFFFF?text=크로스핏2",
      ],
      createdAt: "3일 전 오후 6:20",
    },
  ],
};

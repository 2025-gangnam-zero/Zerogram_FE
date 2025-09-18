import { Meet } from "../types/meet";

// 더 많은 더미 데이터 생성
const generateMockMeets = (): Meet[] => {
  const baseMeets: Meet[] = [
    {
      _id: "1",
      userId: "user1",
      nickname: "헬스러버",
      title: "강남 헬스장에서 함께 운동하실 분 구해요!",
      description:
        "강남역 근처 헬스장에서 주 3회 운동하고 계신 분들 모집합니다. 초보자도 환영해요!",
      workout_type: "fitness",
      location: "강남구",
      crews: [
        { userId: "user1", nickname: "헬스러버" },
        { userId: "user2", nickname: "운동마니아" },
      ],
      comments: [
        {
          _id: "comment1",
          userId: "user3",
          nickname: "피트니스러버",
          content: "저도 참여하고 싶어요!",
          createdAt: new Date("2024-01-15T10:30:00"),
          updatedAt: new Date("2024-01-15T10:30:00"),
        },
        {
          _id: "comment2",
          userId: "user4",
          nickname: "건강한라이프",
          content: "언제부터 시작하나요?",
          createdAt: new Date("2024-01-15T14:20:00"),
          updatedAt: new Date("2024-01-15T14:20:00"),
        },
      ],
      createdAt: new Date("2024-01-15T09:00:00"),
      updatedAt: new Date("2024-01-15T09:00:00"),
    },
    {
      _id: "2",
      userId: "user5",
      nickname: "러닝크루",
      title: "서초구 한강 러닝 모임",
      description:
        "매주 토요일 오전 7시 한강공원에서 러닝하는 모임입니다. 5km~10km 거리로 진행해요.",
      workout_type: "running",
      location: "서초구",
      crews: [
        { userId: "user5", nickname: "러닝크루" },
        { userId: "user6", nickname: "마라토너" },
        { userId: "user7", nickname: "조깅러버" },
      ],
      comments: [
        {
          _id: "comment3",
          userId: "user8",
          nickname: "러닝초보",
          content: "초보자도 괜찮을까요?",
          createdAt: new Date("2024-01-16T08:15:00"),
          updatedAt: new Date("2024-01-16T08:15:00"),
        },
      ],
      createdAt: new Date("2024-01-16T07:30:00"),
      updatedAt: new Date("2024-01-16T07:30:00"),
    },
    {
      _id: "3",
      userId: "user9",
      nickname: "피트니스킹",
      title: "강남구 크로스핏 함께 하실 분",
      description:
        "크로스핏 입문자들을 위한 모임입니다. 체력 향상과 함께 운동하실 분들 모집해요!",
      workout_type: "fitness",
      location: "강남구",
      crews: [{ userId: "user9", nickname: "피트니스킹" }],
      comments: [],
      createdAt: new Date("2024-01-17T12:00:00"),
      updatedAt: new Date("2024-01-17T12:00:00"),
    },
    {
      _id: "4",
      userId: "user10",
      nickname: "서초러너",
      title: "서초구 야간 러닝 모임",
      description:
        "퇴근 후 저녁 8시에 서초구에서 러닝하는 모임입니다. 3km~5km 거리로 가볍게 뛰어요.",
      workout_type: "running",
      location: "서초구",
      crews: [
        { userId: "user10", nickname: "서초러너" },
        { userId: "user11", nickname: "야간러너" },
      ],
      comments: [
        {
          _id: "comment4",
          userId: "user12",
          nickname: "저녁운동러",
          content: "저도 참여하고 싶습니다!",
          createdAt: new Date("2024-01-17T18:45:00"),
          updatedAt: new Date("2024-01-17T18:45:00"),
        },
        {
          _id: "comment5",
          userId: "user13",
          nickname: "운동초보",
          content: "어디서 만나나요?",
          createdAt: new Date("2024-01-17T19:20:00"),
          updatedAt: new Date("2024-01-17T19:20:00"),
        },
      ],
      createdAt: new Date("2024-01-17T18:00:00"),
      updatedAt: new Date("2024-01-17T18:00:00"),
    },
    {
      _id: "5",
      userId: "user14",
      nickname: "헬스마스터",
      title: "강남구 헬스장 PT 함께 받을 분",
      description:
        "PT 비용을 나눠서 받고 싶어요. 2명이서 함께 하면 더 저렴하게 받을 수 있어요!",
      workout_type: "fitness",
      location: "강남구",
      crews: [{ userId: "user14", nickname: "헬스마스터" }],
      comments: [],
      createdAt: new Date("2024-01-18T11:30:00"),
      updatedAt: new Date("2024-01-18T11:30:00"),
    },
  ];

  // 추가 더미 데이터 생성 (총 32개)
  const additionalMeets: Meet[] = [
    {
      _id: "6",
      userId: "user15",
      nickname: "요가마스터",
      title: "강남구 요가 스튜디오 함께 하실 분",
      description:
        "매주 화, 목요일 저녁 7시에 요가 수업을 함께 들을 분들을 모집합니다. 초보자도 환영해요!",
      workout_type: "fitness",
      location: "강남구",
      crews: [{ userId: "user15", nickname: "요가마스터" }],
      comments: [],
      createdAt: new Date("2024-01-19T09:00:00"),
      updatedAt: new Date("2024-01-19T09:00:00"),
    },
    {
      _id: "7",
      userId: "user16",
      nickname: "서초마라토너",
      title: "서초구 마라톤 준비 모임",
      description:
        "서울마라톤 준비를 위한 장거리 러닝 모임입니다. 10km 이상 뛸 수 있는 분들만 참여해주세요.",
      workout_type: "running",
      location: "서초구",
      crews: [
        { userId: "user16", nickname: "서초마라토너" },
        { userId: "user17", nickname: "마라톤러버" },
      ],
      comments: [
        {
          _id: "comment6",
          userId: "user18",
          nickname: "러닝고수",
          content: "저도 참여하고 싶습니다!",
          createdAt: new Date("2024-01-19T14:30:00"),
          updatedAt: new Date("2024-01-19T14:30:00"),
        },
      ],
      createdAt: new Date("2024-01-19T13:00:00"),
      updatedAt: new Date("2024-01-19T13:00:00"),
    },
    {
      _id: "8",
      userId: "user19",
      nickname: "헬스초보",
      title: "강남구 헬스장 입문자 모임",
      description:
        "헬스장을 처음 시작하는 분들을 위한 모임입니다. 함께 배우고 동기부여를 받아요!",
      workout_type: "fitness",
      location: "강남구",
      crews: [
        { userId: "user19", nickname: "헬스초보" },
        { userId: "user20", nickname: "운동시작러" },
        { userId: "user21", nickname: "건강한시작" },
      ],
      comments: [],
      createdAt: new Date("2024-01-20T10:00:00"),
      updatedAt: new Date("2024-01-20T10:00:00"),
    },
    {
      _id: "9",
      userId: "user22",
      nickname: "서초조깅",
      title: "서초구 아침 조깅 모임",
      description:
        "매일 아침 6시에 서초구에서 조깅하는 모임입니다. 3km~5km 거리로 가볍게 뛰어요.",
      workout_type: "running",
      location: "서초구",
      crews: [
        { userId: "user22", nickname: "서초조깅" },
        { userId: "user23", nickname: "아침러너" },
      ],
      comments: [
        {
          _id: "comment7",
          userId: "user24",
          nickname: "일찍일어나기",
          content: "아침 운동 좋아요!",
          createdAt: new Date("2024-01-20T18:00:00"),
          updatedAt: new Date("2024-01-20T18:00:00"),
        },
      ],
      createdAt: new Date("2024-01-20T17:30:00"),
      updatedAt: new Date("2024-01-20T17:30:00"),
    },
    {
      _id: "10",
      userId: "user25",
      nickname: "피트니스퀸",
      title: "강남구 필라테스 클래스 함께 하실 분",
      description:
        "필라테스 클래스 비용을 나눠서 받고 싶어요. 2명이서 함께 하면 더 저렴해요!",
      workout_type: "fitness",
      location: "강남구",
      crews: [{ userId: "user25", nickname: "피트니스퀸" }],
      comments: [],
      createdAt: new Date("2024-01-21T11:00:00"),
      updatedAt: new Date("2024-01-21T11:00:00"),
    },
    {
      _id: "11",
      userId: "user26",
      nickname: "러닝크루리더",
      title: "서초구 러닝 크루 정기 모임",
      description:
        "매주 일요일 오전 8시에 한강공원에서 정기 러닝 모임을 진행합니다. 5km~15km 거리로 진행해요.",
      workout_type: "running",
      location: "서초구",
      crews: [
        { userId: "user26", nickname: "러닝크루리더" },
        { userId: "user27", nickname: "주말러너" },
        { userId: "user28", nickname: "한강러너" },
        { userId: "user29", nickname: "일요일러너" },
      ],
      comments: [
        {
          _id: "comment8",
          userId: "user30",
          nickname: "러닝신입",
          content: "초보자도 괜찮을까요?",
          createdAt: new Date("2024-01-21T15:20:00"),
          updatedAt: new Date("2024-01-21T15:20:00"),
        },
        {
          _id: "comment9",
          userId: "user31",
          nickname: "러닝마니아",
          content: "저도 참여하고 싶습니다!",
          createdAt: new Date("2024-01-21T16:45:00"),
          updatedAt: new Date("2024-01-21T16:45:00"),
        },
      ],
      createdAt: new Date("2024-01-21T14:00:00"),
      updatedAt: new Date("2024-01-21T14:00:00"),
    },
    {
      _id: "12",
      userId: "user32",
      nickname: "헬스고수",
      title: "강남구 고급 헬스 트레이닝",
      description:
        "고급 헬스 트레이닝을 함께 할 분들을 모집합니다. 1년 이상 경험자만 참여해주세요.",
      workout_type: "fitness",
      location: "강남구",
      crews: [
        { userId: "user32", nickname: "헬스고수" },
        { userId: "user33", nickname: "헬스마스터" },
      ],
      comments: [],
      createdAt: new Date("2024-01-22T09:30:00"),
      updatedAt: new Date("2024-01-22T09:30:00"),
    },
    {
      _id: "13",
      userId: "user34",
      nickname: "서초수영러",
      title: "서초구 수영장 함께 하실 분",
      description:
        "매주 월, 수, 금요일 저녁에 수영장에서 운동하는 모임입니다. 자유형, 배영 등 다양한 수영을 해요.",
      workout_type: "fitness",
      location: "서초구",
      crews: [
        { userId: "user34", nickname: "서초수영러" },
        { userId: "user35", nickname: "수영초보" },
      ],
      comments: [
        {
          _id: "comment10",
          userId: "user36",
          nickname: "물놀이러버",
          content: "수영 좋아해요!",
          createdAt: new Date("2024-01-22T19:00:00"),
          updatedAt: new Date("2024-01-22T19:00:00"),
        },
      ],
      createdAt: new Date("2024-01-22T18:30:00"),
      updatedAt: new Date("2024-01-22T18:30:00"),
    },
    {
      _id: "14",
      userId: "user37",
      nickname: "강남사이클러",
      title: "강남구 자전거 타기 모임",
      description:
        "주말에 한강 자전거길을 따라 자전거를 타는 모임입니다. 20km~30km 거리로 진행해요.",
      workout_type: "running",
      location: "강남구",
      crews: [
        { userId: "user37", nickname: "강남사이클러" },
        { userId: "user38", nickname: "자전거러버" },
      ],
      comments: [],
      createdAt: new Date("2024-01-23T10:00:00"),
      updatedAt: new Date("2024-01-23T10:00:00"),
    },
    {
      _id: "15",
      userId: "user39",
      nickname: "서초홈트레이닝",
      title: "서초구 홈트레이닝 함께 하실 분",
      description:
        "집에서 할 수 있는 홈트레이닝을 함께 하는 모임입니다. 줌으로 화상 연결해서 운동해요.",
      workout_type: "fitness",
      location: "서초구",
      crews: [
        { userId: "user39", nickname: "서초홈트레이닝" },
        { userId: "user40", nickname: "홈트러버" },
        { userId: "user41", nickname: "집에서운동" },
      ],
      comments: [
        {
          _id: "comment11",
          userId: "user42",
          nickname: "홈트초보",
          content: "집에서 운동하기 좋겠어요!",
          createdAt: new Date("2024-01-23T20:30:00"),
          updatedAt: new Date("2024-01-23T20:30:00"),
        },
      ],
      createdAt: new Date("2024-01-23T19:00:00"),
      updatedAt: new Date("2024-01-23T19:00:00"),
    },
    {
      _id: "16",
      userId: "user43",
      nickname: "강남테니스",
      title: "강남구 테니스 함께 하실 분",
      description:
        "테니스 코트에서 함께 테니스를 치는 모임입니다. 초보자도 환영해요!",
      workout_type: "fitness",
      location: "강남구",
      crews: [{ userId: "user43", nickname: "강남테니스" }],
      comments: [],
      createdAt: new Date("2024-01-24T14:00:00"),
      updatedAt: new Date("2024-01-24T14:00:00"),
    },
  ];

  return [...baseMeets, ...additionalMeets];
};

export const mockMeets: Meet[] = generateMockMeets();

// 페이지네이션을 위한 함수들
export const getMeetsByPage = (page: number, limit: number = 16): Meet[] => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return mockMeets.slice(startIndex, endIndex);
};

export const getTotalPages = (limit: number = 16): number => {
  return Math.ceil(mockMeets.length / limit);
};

export const searchMeets = (
  query: string,
  page: number = 1,
  limit: number = 16
): Meet[] => {
  if (!query.trim()) {
    return getMeetsByPage(page, limit);
  }

  const filteredMeets = mockMeets.filter(
    (meet) =>
      meet.title.toLowerCase().includes(query.toLowerCase()) ||
      meet.description.toLowerCase().includes(query.toLowerCase()) ||
      meet.nickname.toLowerCase().includes(query.toLowerCase())
  );

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return filteredMeets.slice(startIndex, endIndex);
};

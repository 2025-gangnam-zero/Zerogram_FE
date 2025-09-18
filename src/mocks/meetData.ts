import { Meet } from "../types/meet";

export const mockMeets: Meet[] = [
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

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Calendar from "react-calendar";
import type { Value } from "react-calendar/dist/shared/types.js";
import { useUserStore } from "../store/userStore";
import { useAuthStore } from "../store/authStore";
import { UI_CONSTANTS, LAYOUT_CONSTANTS } from "../constants";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import WorkoutForm from "../components/workout/WorkoutForm";
import WorkoutList from "../components/workout/WorkoutList";
import WorkoutDetailModal from "../components/workout/WorkoutDetailModal";
import "react-calendar/dist/Calendar.css";
import { useWorkoutStore } from "../store/workoutStore";

const PageContainer = styled.div`
  max-width: ${LAYOUT_CONSTANTS.MAX_WIDTH};
  margin: 0 auto;
  padding: ${LAYOUT_CONSTANTS.CONTAINER_PADDING};
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  text-align: center;
  margin-bottom: ${UI_CONSTANTS.SPACING.XL};
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${UI_CONSTANTS.SPACING.XL};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CalendarSection = styled.div`
  background: white;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.LG};
  padding: ${UI_CONSTANTS.SPACING.LG};
  box-shadow: ${UI_CONSTANTS.SHADOWS.MD};
`;

const CalendarWrapper = styled.div`
  .react-calendar {
    width: 100%;
    border: none;
    font-family: inherit;
  }

  .react-calendar__tile {
    border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
    transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};

    &:hover {
      background-color: ${UI_CONSTANTS.COLORS.LIGHT};
    }
  }

  .react-calendar__tile--active {
    background-color: ${UI_CONSTANTS.COLORS.PRIMARY} !important;
    color: white;
  }
`;

const WorkoutSection = styled.div`
  background: white;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.LG};
  padding: ${UI_CONSTANTS.SPACING.LG};
  box-shadow: ${UI_CONSTANTS.SHADOWS.MD};
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin-bottom: ${UI_CONSTANTS.SPACING.LG};
`;

const CreateButton = styled(Button)`
  margin-bottom: ${UI_CONSTANTS.SPACING.LG};
`;

const SelectedDate = styled.div`
  text-align: center;
  margin-bottom: ${UI_CONSTANTS.SPACING.LG};
  padding: ${UI_CONSTANTS.SPACING.MD};
  background-color: ${UI_CONSTANTS.COLORS.LIGHT};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};

  span {
    font-size: 18px;
    font-weight: 600;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  }
`;

// 로컬 시간대 기준으로 날짜 문자열을 반환하는 함수
// const getLocalDateString = (date: Date): string => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

const WorkoutLogPage: React.FC = () => {
  const { isLoggedIn } = useAuthStore();
  const { id, fetchUserInfo } = useUserStore();
  const {
    isLoading,
    error,
    setCurrentMonth,
    getWorkoutsByDate,
    refreshWorkouts,
    getWorkoutById,
  } = useWorkoutStore();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null
  );

  // 선택된 날짜의 운동일지만 필터링
  const selectedDateWorkouts = getWorkoutsByDate(selectedDate);

  // 선택된 운동일지 찾기
  const selectedWorkout = selectedWorkoutId
    ? getWorkoutById(selectedWorkoutId)
    : null;

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      if (isLoggedIn && !id) {
        try {
          await fetchUserInfo();
        } catch (error) {
          console.error("사용자 정보 로드 실패:", error);
        }
      }
      setIsUserLoading(false);
    };

    loadUserInfo();
  }, [isLoggedIn, id, fetchUserInfo]);

  // 초기 운동일지 로드
  useEffect(() => {
    if (isLoggedIn && id) {
      const now = new Date();
      setCurrentMonth(now.getFullYear(), now.getMonth() + 1);
    }
  }, [isLoggedIn, id, setCurrentMonth]);

  // 달력에서 월 변경 시 새로운 데이터 로드
  const handleActiveStartDateChange = ({
    activeStartDate,
  }: {
    activeStartDate: Date | null;
  }) => {
    if (activeStartDate && isLoggedIn && id) {
      const year = activeStartDate.getFullYear();
      const month = activeStartDate.getMonth() + 1;
      setCurrentMonth(year, month);
    }
  };

  // 날짜 선택 시 - Value 타입으로 수정
  const handleDateChange = (value: Value) => {
    // Value는 Date | null | [Date | null, Date | null] 타입
    let selectedDate: Date | null = null;

    if (value) {
      if (Array.isArray(value)) {
        // Range 선택의 경우 첫 번째 날짜 사용
        selectedDate = value[0];
      } else {
        // 단일 날짜 선택
        selectedDate = value;
      }
    }

    if (selectedDate) {
      setSelectedDate(selectedDate);

      // 선택된 날짜가 현재 로드된 월과 다르면 새로운 데이터 로드
      const selectedYear = selectedDate.getFullYear();
      const selectedMonth = selectedDate.getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      if (selectedYear !== currentYear || selectedMonth !== currentMonth) {
        setCurrentMonth(selectedYear, selectedMonth);
      }
    }
  };

  // 운동일지 추가 성공 시
  // const handleWorkoutSuccess = () => {
  //   setIsModalOpen(false);
  //   refreshWorkouts(); // 데이터 새로고침
  // };

  // 에러 처리
  useEffect(() => {
    if (error) {
      console.error("운동일지 로드 에러:", error);
      // 필요시 사용자에게 에러 표시
    }
  }, [error]);

  const handleCreateWorkout = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleWorkoutCreated = () => {
    setIsModalOpen(false);
    refreshWorkouts(); // 새로운 운동일지 생성 후 목록 새로고침
  };

  const handleViewDetail = (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
  };

  const handleDetailModalClose = () => {
    setSelectedWorkoutId(null);
  };

  const handleWorkoutUpdated = () => {
    refreshWorkouts(); // 운동일지 수정/삭제 후 목록 새로고침
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  // 로그인하지 않은 경우
  if (!isLoggedIn) {
    return (
      <PageContainer>
        <PageTitle>로그인이 필요합니다</PageTitle>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Button onClick={() => (window.location.href = "/login")}>
            로그인하러 가기
          </Button>
        </div>
      </PageContainer>
    );
  }

  // 사용자 정보 로딩 중
  if (isUserLoading) {
    return (
      <PageContainer>
        <PageTitle>사용자 정보를 불러오는 중...</PageTitle>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle>운동일지</PageTitle>

      <ContentWrapper>
        <CalendarSection>
          <SectionTitle>날짜 선택</SectionTitle>
          <CalendarWrapper>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              locale="ko-KR"
              onActiveStartDateChange={handleActiveStartDateChange}
            />
          </CalendarWrapper>
        </CalendarSection>

        <WorkoutSection>
          <SectionTitle>운동 기록</SectionTitle>
          <SelectedDate>
            <span>{formatSelectedDate(selectedDate)}</span>
          </SelectedDate>

          <CreateButton onClick={handleCreateWorkout} fullWidth>
            일지 작성
          </CreateButton>

          <WorkoutList
            workouts={selectedDateWorkouts} // 필터링된 데이터 사용
            isLoading={isLoading}
            onWorkoutUpdated={refreshWorkouts}
            onViewDetail={handleViewDetail}
          />
        </WorkoutSection>
      </ContentWrapper>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="운동일지 작성"
      >
        <WorkoutForm
          selectedDate={selectedDate}
          onSuccess={handleWorkoutCreated}
          onCancel={handleModalClose}
        />
      </Modal>

      <WorkoutDetailModal
        isOpen={selectedWorkoutId !== null}
        onClose={handleDetailModalClose}
        workout={selectedWorkout}
        onWorkoutUpdated={handleWorkoutUpdated}
      />
    </PageContainer>
  );
};

export default WorkoutLogPage;

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import Calendar from "react-calendar";
import { useUserStore } from "../store/userStore";
import { useAuthStore } from "../store/authStore";
import { UI_CONSTANTS, LAYOUT_CONSTANTS } from "../constants";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import WorkoutForm from "../components/workout/WorkoutForm";
import WorkoutList from "../components/workout/WorkoutList";
import { getWorkoutsByDateApi } from "../api/workout";
import { workouts } from "../types";
import "react-calendar/dist/Calendar.css";

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

const WorkoutLogPage: React.FC = () => {
  const { isLoggedIn } = useAuthStore();
  const { id, fetchUserInfo } = useUserStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workouts, setWorkouts] = useState<workouts[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true);

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

  // 선택된 날짜의 운동일지 가져오기
  const fetchWorkoutsByDate = useCallback(
    async (date: Date) => {
      if (!isLoggedIn || !id) return;

      setIsLoading(true);
      try {
        const dateString = date.toISOString().split("T")[0];
        const response = await getWorkoutsByDateApi(dateString);
        setWorkouts(response.data);
      } catch (error) {
        console.error("운동일지 조회 실패:", error);
        setWorkouts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoggedIn, id]
  );

  // 컴포넌트 마운트 시 오늘 날짜 운동일지 조회
  useEffect(() => {
    if (!isUserLoading && isLoggedIn && id) {
      fetchWorkoutsByDate(selectedDate);
    }
  }, [selectedDate, id, isLoggedIn, isUserLoading, fetchWorkoutsByDate]);

  const handleDateChange = (value: any) => {
    setSelectedDate(value as Date);
  };

  const handleCreateWorkout = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleWorkoutCreated = () => {
    setIsModalOpen(false);
    fetchWorkoutsByDate(selectedDate); // 새로운 운동일지 생성 후 목록 새로고침
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
            workouts={workouts}
            isLoading={isLoading}
            onWorkoutUpdated={() => fetchWorkoutsByDate(selectedDate)}
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
    </PageContainer>
  );
};

export default WorkoutLogPage;

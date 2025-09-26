import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Utensils, Dumbbell, Users } from "lucide-react";
import { useDietStore } from "../store/dietStore";
import { useWorkoutStore } from "../store/workoutStore";
import { useMeetStore } from "../store/meetStore";
import { UI_CONSTANTS } from "../constants";
import DietLogCard from "../components/home/DietLogCard";
import WorkoutLogCard from "../components/home/WorkoutLogCard";
import MeetCard from "../components/home/MeetCard";
import CombinedCalorieChart from "../components/home/CombinedCalorieChart";
import DietLogModal from "../components/diet/DietLogModal";
import WorkoutDetailModal from "../components/workout/WorkoutDetailModal";
import MeetDetailModal from "../components/meet/MeetDetailModal";
import { DietLogResponse } from "../types/diet";
import { WorkoutStatePopulated } from "../types";
import { Meet } from "../types/meet";
import { useNavigate } from "react-router-dom";

const HomeContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin-bottom: 30px;
  font-weight: 700;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: color ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:hover {
    color: ${UI_CONSTANTS.COLORS.PRIMARY};
  }
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ChartSection = styled.div`
  grid-column: 1 / -1;
  margin-top: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-style: italic;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 20px;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const HomePage: React.FC = () => {
  const [selectedDietLog, setSelectedDietLog] =
    useState<DietLogResponse | null>(null);
  const [selectedWorkout, setSelectedWorkout] =
    useState<WorkoutStatePopulated | null>(null);
  const [selectedMeet, setSelectedMeet] = useState<Meet | null>(null);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);

  // Store hooks
  const {
    monthlyLogs: dietLogs,
    setCurrentMonth: setDietCurrentMonth,
    setEditingDietLog,
    openModal: openDietModal,
    isModalOpen: isDietStoreModalOpen,
    closeModal: closeDietModal,
  } = useDietStore();

  const {
    workouts,
    setCurrentMonth: setWorkoutCurrentMonth,
    refreshWorkouts,
  } = useWorkoutStore();

  const {
    meets,
    fetchMeets,
    openDetailModal: openMeetDetailModal,
    closeDetailModal: closeMeetDetailModal,
    isDetailModalOpen: isMeetDetailModalOpen,
    toggleCrew,
    addComment,
    updateMeet,
    updateComment,
    deleteMeet,
    deleteComment,
    isSubmitting,
    isLoading: isMeetLoading,
  } = useMeetStore();

  // 현재 월 데이터 로드
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    setDietCurrentMonth(currentYear, currentMonth);
    setWorkoutCurrentMonth(currentYear, currentMonth);
    fetchMeets();
  }, [setDietCurrentMonth, setWorkoutCurrentMonth, fetchMeets]);

  // 최신 데이터 정렬 및 제한
  const recentDietLogs = dietLogs
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const recentWorkouts = workouts
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const recentMeets = meets
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  // 이벤트 핸들러들
  const handleDietLogClick = (dietLog: DietLogResponse) => {
    setSelectedDietLog(dietLog);
    setEditingDietLog(dietLog);
    openDietModal();
  };

  const handleDietModalClose = () => {
    closeDietModal();
    setSelectedDietLog(null);
  };

  const handleWorkoutClick = (workout: WorkoutStatePopulated) => {
    setSelectedWorkout(workout);
    setIsWorkoutModalOpen(true);
  };

  const handleMeetClick = (meet: Meet) => {
    setSelectedMeet(meet);
    openMeetDetailModal(meet._id);
  };

  const handleWorkoutModalClose = () => {
    setIsWorkoutModalOpen(false);
    setSelectedWorkout(null);
    refreshWorkouts(); // 데이터 새로고침
  };

  const handleMeetModalClose = () => {
    closeMeetDetailModal();
    setSelectedMeet(null);
  };

  const navigate = useNavigate();

  return (
    <HomeContainer>
      <PageTitle>홈</PageTitle>

      <GridContainer>
        {/* 최근 식단일지 */}
        <Section>
          <SectionTitle onClick={() => navigate("/diet-log")}>
            <SectionIcon>
              <Utensils size={20} />
            </SectionIcon>
            최근 식단일지
          </SectionTitle>
          <CardsContainer>
            {isDietStoreModalOpen ? (
              <LoadingState>데이터를 불러오는 중...</LoadingState>
            ) : recentDietLogs.length > 0 ? (
              recentDietLogs.map((dietLog) => (
                <DietLogCard
                  key={dietLog._id}
                  dietLog={dietLog}
                  onClick={() => handleDietLogClick(dietLog)}
                />
              ))
            ) : (
              <EmptyState>기록된 식단일지가 없습니다</EmptyState>
            )}
          </CardsContainer>
        </Section>

        {/* 최근 운동일지 */}
        <Section>
          <SectionTitle onClick={() => navigate("/workout")}>
            <SectionIcon>
              <Dumbbell size={20} />
            </SectionIcon>
            최근 운동일지
          </SectionTitle>
          <CardsContainer>
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map((workout) => (
                <WorkoutLogCard
                  key={workout._id}
                  workout={workout}
                  onClick={() => handleWorkoutClick(workout)}
                />
              ))
            ) : (
              <EmptyState>기록된 운동일지가 없습니다</EmptyState>
            )}
          </CardsContainer>
        </Section>

        {/* 최근 모집게시판 */}
        <Section>
          <SectionTitle onClick={() => navigate("/meet")}>
            <SectionIcon>
              <Users size={20} />
            </SectionIcon>
            최근 모집게시판
          </SectionTitle>
          <CardsContainer>
            {isMeetLoading ? (
              <LoadingState>데이터를 불러오는 중...</LoadingState>
            ) : recentMeets.length > 0 ? (
              recentMeets.map((meet) => (
                <MeetCard
                  key={meet._id}
                  meet={meet}
                  onClick={() => handleMeetClick(meet)}
                />
              ))
            ) : (
              <EmptyState>등록된 모집글이 없습니다</EmptyState>
            )}
          </CardsContainer>
        </Section>

        {/* 칼로리 차트 */}
        <ChartSection>
          <CombinedCalorieChart />
        </ChartSection>
      </GridContainer>

      {/* 모달들 */}
      {selectedDietLog && (
        <DietLogModal
          onSuccess={() => {
            // 식단일지 모달 성공 시 데이터 새로고침
            const now = new Date();
            setDietCurrentMonth(now.getFullYear(), now.getMonth() + 1);
            handleDietModalClose();
          }}
        />
      )}

      {selectedWorkout && (
        <WorkoutDetailModal
          isOpen={isWorkoutModalOpen}
          onClose={handleWorkoutModalClose}
          workout={selectedWorkout}
          onWorkoutUpdated={() => {
            refreshWorkouts();
          }}
        />
      )}

      {selectedMeet && (
        <MeetDetailModal
          isOpen={isMeetDetailModalOpen}
          onClose={handleMeetModalClose}
          meet={selectedMeet}
          onJoin={async (meetId) => {
            try {
              await toggleCrew(meetId);
              await fetchMeets(); // 데이터 새로고침
            } catch (error) {
              console.error("참여 처리 실패:", error);
            }
          }}
          onLeave={async (meetId) => {
            try {
              await toggleCrew(meetId);
              await fetchMeets(); // 데이터 새로고침
            } catch (error) {
              console.error("참여 취소 실패:", error);
            }
          }}
          onAddComment={async (meetId, content) => {
            try {
              await addComment(meetId, content);
            } catch (error) {
              console.error("댓글 추가 실패:", error);
            }
          }}
          onUpdateMeet={async (meetId, data) => {
            try {
              // MeetFormData 타입에 맞게 변환
              const currentLocation = selectedMeet?.location;
              const validLocation: "강남구" | "서초구" =
                currentLocation === "강남구" || currentLocation === "서초구"
                  ? currentLocation
                  : "강남구";

              const meetFormData = {
                title: data.title,
                description: data.description,
                workout_type: selectedMeet?.workout_type || "fitness",
                location: validLocation,
                images: data.images || [],
                newImages: data.newImages || [],
                existingImages: data.existingImages || [],
              };
              await updateMeet(meetId, meetFormData);
              await fetchMeets(); // 데이터 새로고침
            } catch (error) {
              console.error("모집글 수정 실패:", error);
            }
          }}
          onUpdateComment={async (meetId, commentId, content) => {
            try {
              await updateComment(meetId, commentId, content);
            } catch (error) {
              console.error("댓글 수정 실패:", error);
            }
          }}
          onDeleteMeet={async (meetId) => {
            try {
              await deleteMeet(meetId);
              handleMeetModalClose(); // 모달 닫기
              await fetchMeets(); // 데이터 새로고침
            } catch (error) {
              console.error("모집글 삭제 실패:", error);
            }
          }}
          onDeleteComment={async (meetId, commentId) => {
            try {
              await deleteComment(meetId, commentId);
            } catch (error) {
              console.error("댓글 삭제 실패:", error);
            }
          }}
          isLoading={isSubmitting}
        />
      )}
    </HomeContainer>
  );
};

export default HomePage;

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { WorkoutType } from "../types/workout";
import { Location } from "../types/meet";
import { UI_CONSTANTS } from "../constants";
import WorkoutFilter from "../components/meet/WorkoutFilter";
import LocationFilter from "../components/meet/LocationFilter";
import MeetCard from "../components/meet/MeetCard";
import SearchBar from "../components/meet/SearchBar";
import MeetForm from "../components/meet/MeetForm";
import { MeetFormData } from "../types/meet";
import MeetDetailModal from "../components/meet/MeetDetailModal";
import Modal from "../components/common/Modal";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useMeetStore } from "../store/meetStore";
import { useUserStore } from "../store/userStore";
import { Meet } from "../types/meet";

const PageContainer = styled.div`
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 80vh;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 30px;
  font-weight: 700;
  text-align: center;
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 100px;

  @media (max-width: 768px) {
    position: static;
  }
`;

const MeetListSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MeetList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
`;

const EmptyDescription = styled.p`
  font-size: 1rem;
  line-height: 1.5;
`;

const CreateButton = styled.button`
  background: ${UI_CONSTANTS.COLORS.PRIMARY};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};
  margin-bottom: 20px;

  &:hover {
    background: ${UI_CONSTANTS.COLORS.PRIMARY_HOVER};
    transform: translateY(-1px);
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid ${UI_CONSTANTS.COLORS.PRIMARY};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-size: 0.9rem;
  margin: 0;
`;

const EndMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-size: 0.9rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
`;

export default function MeetPage() {
  // MeetStore에서 상태와 액션 가져오기
  const {
    meets,
    currentMeet,
    isLoading,
    isSubmitting,
    error,
    hasMore,
    filters,
    isDetailModalOpen,
    isFormModalOpen,
    fetchMeets,
    createMeet,
    updateMeet,
    deleteMeet,
    addComment,
    updateComment,
    deleteComment,
    toggleCrew,
    setFilters,
    applyFilters,
    openDetailModal,
    closeDetailModal,
    openFormModal,
    closeFormModal,
    clearError,
  } = useMeetStore();

  // UserStore에서 현재 사용자 정보 가져오기
  const { id: currentUserId, fetchUserInfo } = useUserStore();

  // 사용자 정보가 없으면 로드
  useEffect(() => {
    if (!currentUserId) {
      fetchUserInfo();
    }
  }, [currentUserId, fetchUserInfo]);

  // 로컬 상태
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<
    WorkoutType | "all"
  >(filters.workout_type);
  const [selectedLocation, setSelectedLocation] = useState<Location | "all">(
    filters.location
  );
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm);
  const [formResetTrigger, setFormResetTrigger] = useState(0);

  // 필터링된 게시글들 (이제 서버에서 필터링되므로 meets를 그대로 사용)
  const filteredMeets = meets || [];

  // 더 많은 데이터 로드 함수
  const loadMoreData = useCallback(async () => {
    if (isLoading || !hasMore) return;
    await fetchMeets(false);
  }, [isLoading, hasMore, fetchMeets]);

  // 무한 스크롤 훅
  const { isIntersecting } = useInfiniteScroll({
    hasMore,
    isLoading,
  });

  // 초기 데이터 로드
  useEffect(() => {
    fetchMeets(true);
  }, [fetchMeets]);

  // 무한 스크롤 트리거
  useEffect(() => {
    if (isIntersecting) {
      loadMoreData();
    }
  }, [isIntersecting, loadMoreData]);

  // 필터 변경 시 데이터 새로고침
  useEffect(() => {
    setFilters({
      workout_type: selectedWorkoutType,
      location: selectedLocation,
      searchTerm: searchTerm,
    });
  }, [selectedWorkoutType, selectedLocation, searchTerm, setFilters]);

  // 필터가 변경되면 데이터 새로고침
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 500); // 디바운싱

    return () => clearTimeout(timeoutId);
  }, [filters, applyFilters]);

  const handleMeetClick = (meetId: string) => {
    openDetailModal(meetId);
  };

  const handleDetailModalClose = () => {
    closeDetailModal();
  };

  const handleCreateMeet = () => {
    openFormModal();
  };

  const handleModalClose = () => {
    closeFormModal();
  };

  const handleFormSubmit = async (formData: MeetFormData) => {
    try {
      await createMeet(formData);
      // 게시글 생성 성공 후 폼 초기화
      setFormResetTrigger((prev) => prev + 1);
      closeFormModal();
    } catch (error) {
      console.error("Failed to create meet:", error);
    }
  };

  const handleJoinMeet = async (meetId: string) => {
    try {
      await toggleCrew(meetId);
    } catch (error) {
      console.error("Failed to join meet:", error);
    }
  };

  const handleLeaveMeet = async (meetId: string) => {
    try {
      await toggleCrew(meetId);
    } catch (error) {
      console.error("Failed to leave meet:", error);
    }
  };

  const handleAddComment = async (meetId: string, content: string) => {
    try {
      await addComment(meetId, content);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleUpdateMeet = async (
    meetId: string,
    data: {
      title: string;
      description: string;
      images?: string[];
      newImages?: File[];
      existingImages?: string[];
    }
  ) => {
    try {
      await updateMeet(meetId, data as MeetFormData);
    } catch (error) {
      console.error("Failed to update meet:", error);
    }
  };

  const handleUpdateComment = async (
    meetId: string,
    commentId: string,
    content: string
  ) => {
    try {
      await updateComment(meetId, commentId, content);
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const handleDeleteMeet = async (meetId: string) => {
    try {
      await deleteMeet(meetId);
    } catch (error) {
      console.error("Failed to delete meet:", error);
    }
  };

  const handleDeleteComment = async (meetId: string, commentId: string) => {
    try {
      await deleteComment(meetId, commentId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  // 사용자가 참여 중인지 확인하는 함수
  const isUserJoined = (meet: Meet | null | undefined): boolean => {
    if (!meet || !meet.crews || !Array.isArray(meet.crews) || !currentUserId) {
      return false;
    }
    return meet.crews.some((crew) => crew.userId === currentUserId);
  };

  return (
    <PageContainer>
      <PageTitle>모집게시판</PageTitle>

      {/* 에러 메시지 표시 */}
      {error && (
        <div
          style={{
            background: "#fee",
            color: "#c33",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {error}
          <button
            onClick={clearError}
            style={{
              marginLeft: "10px",
              background: "none",
              border: "none",
              color: "#c33",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="게시글 제목, 내용, 작성자로 검색..."
      />

      <ContentWrapper>
        <FilterSection>
          <WorkoutFilter
            selectedType={selectedWorkoutType}
            onTypeChange={setSelectedWorkoutType}
          />
          <LocationFilter
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
          />
        </FilterSection>

        <MeetListSection>
          <CreateButton onClick={handleCreateMeet}>
            + 새 모집글 작성
          </CreateButton>

          {filteredMeets && filteredMeets.length > 0 ? (
            <>
              <MeetList>
                {filteredMeets.map((meet, index) => (
                  <MeetCard
                    key={meet._id || `meet-${index}`}
                    meet={meet}
                    onClick={() => handleMeetClick(meet._id)}
                  />
                ))}
              </MeetList>

              {isLoading && (
                <LoadingState>
                  <LoadingSpinner />
                  <LoadingText>게시글을 불러오는 중...</LoadingText>
                </LoadingState>
              )}

              {!hasMore && filteredMeets.length > 0 && (
                <EndMessage>모든 게시글을 불러왔습니다</EndMessage>
              )}
            </>
          ) : !isLoading ? (
            <EmptyState>
              <EmptyIcon>🔍</EmptyIcon>
              <EmptyTitle>검색 결과가 없습니다</EmptyTitle>
              <EmptyDescription>
                다른 필터 조건을 시도해보거나
                <br />
                새로운 모집글을 작성해보세요
              </EmptyDescription>
            </EmptyState>
          ) : null}
        </MeetListSection>
      </ContentWrapper>

      {/* 모집글 작성 모달 */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleModalClose}
        title="새 모집글 작성"
        // maxWidth="600px"
      >
        <MeetForm
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
          isLoading={isSubmitting}
          resetTrigger={formResetTrigger}
        />
      </Modal>

      {/* 게시글 상세 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        title=""
        // maxWidth="900px"
      >
        <MeetDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleDetailModalClose}
          meet={currentMeet}
          onJoin={handleJoinMeet}
          onLeave={handleLeaveMeet}
          onAddComment={handleAddComment}
          onUpdateMeet={handleUpdateMeet}
          onUpdateComment={handleUpdateComment}
          onDeleteMeet={handleDeleteMeet}
          onDeleteComment={handleDeleteComment}
          isJoined={isUserJoined(currentMeet)}
          isLoading={isSubmitting}
        />
      </Modal>
    </PageContainer>
  );
}

import React, { useState, useMemo, useEffect, useCallback } from "react";
import styled from "styled-components";
import { WorkoutType } from "../types/workout";
import { Location } from "../types/meet";
import { UI_CONSTANTS } from "../constants";
import WorkoutFilter from "../components/meet/WorkoutFilter";
import LocationFilter from "../components/meet/LocationFilter";
import MeetCard from "../components/meet/MeetCard";
import SearchBar from "../components/meet/SearchBar";
import MeetForm, { MeetFormData } from "../components/meet/MeetForm";
import MeetDetailModal from "../components/meet/MeetDetailModal";
import Modal from "../components/common/Modal";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { getMeetsByPage, searchMeets } from "../mocks/meetData";
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
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<
    WorkoutType | "all"
  >("all");
  const [selectedLocation, setSelectedLocation] = useState<Location | "all">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allMeets, setAllMeets] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMeet, setSelectedMeet] = useState<Meet | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const ITEMS_PER_PAGE = 16;

  // 검색과 필터링이 적용된 게시글들
  const filteredMeets = useMemo(() => {
    let meets = searchTerm.trim() ? searchResults : allMeets;

    // 운동 종류 필터링
    if (selectedWorkoutType !== "all") {
      meets = meets.filter((meet) => meet.workout_type === selectedWorkoutType);
    }

    // 지역 필터링
    if (selectedLocation !== "all") {
      meets = meets.filter((meet) => meet.location === selectedLocation);
    }

    return meets;
  }, [
    allMeets,
    searchResults,
    searchTerm,
    selectedWorkoutType,
    selectedLocation,
  ]);

  // 일반 데이터 로드 함수
  const loadMoreData = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      // 실제 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newMeets = getMeetsByPage(currentPage, ITEMS_PER_PAGE);

      if (newMeets.length === 0) {
        setHasMore(false);
      } else {
        setAllMeets((prev) => [...prev, ...newMeets]);
        setCurrentPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to load more data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, isLoading, hasMore]);

  // 검색 결과 로드 함수
  const loadMoreSearchResults = useCallback(async () => {
    if (isLoading || !hasMore || !searchTerm.trim()) return;

    setIsLoading(true);

    try {
      // 실제 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newSearchResults = searchMeets(
        searchTerm,
        currentPage,
        ITEMS_PER_PAGE
      );

      if (newSearchResults.length === 0) {
        setHasMore(false);
      } else {
        setSearchResults((prev) => [...prev, ...newSearchResults]);
        setCurrentPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to load more search results:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, isLoading, hasMore, searchTerm]);

  // 무한 스크롤 훅
  const { isIntersecting } = useInfiniteScroll({
    hasMore,
    isLoading,
  });

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const initialMeets = getMeetsByPage(1, ITEMS_PER_PAGE);
        setAllMeets(initialMeets);
        setCurrentPage(2);
        setHasMore(initialMeets.length === ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // 무한 스크롤 트리거
  useEffect(() => {
    if (isIntersecting) {
      if (searchTerm.trim()) {
        loadMoreSearchResults();
      } else {
        loadMoreData();
      }
    }
  }, [isIntersecting, loadMoreData, loadMoreSearchResults, searchTerm]);

  // 검색어나 필터가 변경되면 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
    setAllMeets([]);
    setSearchResults([]);
    setHasMore(true);

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (searchTerm.trim()) {
          // 검색 모드: 검색 결과 로드
          const initialSearchResults = searchMeets(
            searchTerm,
            1,
            ITEMS_PER_PAGE
          );
          setSearchResults(initialSearchResults);
          setHasMore(initialSearchResults.length === ITEMS_PER_PAGE);
        } else {
          // 일반 모드: 전체 데이터 로드
          const initialMeets = getMeetsByPage(1, ITEMS_PER_PAGE);
          setAllMeets(initialMeets);
          setHasMore(initialMeets.length === ITEMS_PER_PAGE);
        }

        setCurrentPage(2);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [searchTerm, selectedWorkoutType, selectedLocation]);

  const handleMeetClick = (meetId: string) => {
    const meet = [...allMeets, ...searchResults].find((m) => m._id === meetId);
    if (meet) {
      setSelectedMeet(meet);
      setIsDetailModalOpen(true);
    }
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedMeet(null);
  };

  const handleCreateMeet = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (formData: MeetFormData) => {
    setIsSubmitting(true);

    try {
      // 실제 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("New meet created:", formData);

      // TODO: 실제 API 호출로 게시글 생성
      // const newMeet = await createMeet(formData);

      // 성공 시 모달 닫기 및 목록 새로고침
      setIsModalOpen(false);

      // TODO: 목록 새로고침 로직 추가
      // refreshMeets();
    } catch (error) {
      console.error("Failed to create meet:", error);
      // TODO: 에러 메시지 표시
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinMeet = async (meetId: string) => {
    setIsJoining(true);

    try {
      // 실제 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Joined meet:", meetId);

      // TODO: 실제 API 호출로 참여 처리
      // await joinMeet(meetId);

      // 성공 시 목록 새로고침
      // refreshMeets();
    } catch (error) {
      console.error("Failed to join meet:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveMeet = async (meetId: string) => {
    setIsJoining(true);

    try {
      // 실제 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Left meet:", meetId);

      // TODO: 실제 API 호출로 참여 취소 처리
      // await leaveMeet(meetId);

      // 성공 시 목록 새로고침
      // refreshMeets();
    } catch (error) {
      console.error("Failed to leave meet:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleAddComment = async (meetId: string, content: string) => {
    setIsCommenting(true);

    try {
      // 실제 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Added comment to meet:", meetId, content);

      // TODO: 실제 API 호출로 댓글 추가
      // await addComment(meetId, content);

      // 성공 시 목록 새로고침
      // refreshMeets();
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleUpdateMeet = async (
    meetId: string,
    data: { title: string; description: string }
  ) => {
    setIsCommenting(true);

    try {
      // 실제 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Updated meet:", meetId, data);

      // TODO: 실제 API 호출로 게시글 수정
      // await updateMeet(meetId, data);

      // 성공 시 목록 새로고침
      // refreshMeets();
    } catch (error) {
      console.error("Failed to update meet:", error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleUpdateComment = async (
    meetId: string,
    commentId: string,
    content: string
  ) => {
    setIsCommenting(true);

    try {
      // 실제 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Updated comment:", meetId, commentId, content);

      // TODO: 실제 API 호출로 댓글 수정
      // await updateComment(meetId, commentId, content);

      // 성공 시 목록 새로고침
      // refreshMeets();
    } catch (error) {
      console.error("Failed to update comment:", error);
    } finally {
      setIsCommenting(false);
    }
  };

  // 사용자가 참여 중인지 확인하는 함수 (임시)
  const isUserJoined = (meet: Meet): boolean => {
    // TODO: 실제 사용자 ID와 비교
    return meet.crews.some((crew) => crew.userId === "current-user-id");
  };

  return (
    <PageContainer>
      <PageTitle>모집게시판</PageTitle>

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

          {filteredMeets.length > 0 ? (
            <>
              <MeetList>
                {filteredMeets.map((meet) => (
                  <MeetCard
                    key={meet._id}
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
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="새 모집글 작성"
        // maxWidth="600px"
      >
        <MeetForm
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
          isLoading={isSubmitting}
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
          meet={selectedMeet}
          onJoin={handleJoinMeet}
          onLeave={handleLeaveMeet}
          onAddComment={handleAddComment}
          onUpdateMeet={handleUpdateMeet}
          onUpdateComment={handleUpdateComment}
          isJoined={selectedMeet ? isUserJoined(selectedMeet) : false}
          isLoading={isJoining || isCommenting}
        />
      </Modal>
    </PageContainer>
  );
}

import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { WorkoutType } from "../types/workout";
import { Location } from "../types/meet";
import { UI_CONSTANTS } from "../constants";
import WorkoutFilter from "../components/meet/WorkoutFilter";
import LocationFilter from "../components/meet/LocationFilter";
import MeetCard from "../components/meet/MeetCard";
import { mockMeets } from "../mocks/meetData";

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

export default function MeetPage() {
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<
    WorkoutType | "all"
  >("all");
  const [selectedLocation, setSelectedLocation] = useState<Location | "all">(
    "all"
  );

  const filteredMeets = useMemo(() => {
    return mockMeets.filter((meet) => {
      const workoutMatch =
        selectedWorkoutType === "all" ||
        meet.workout_type === selectedWorkoutType;
      const locationMatch =
        selectedLocation === "all" || meet.location === selectedLocation;
      return workoutMatch && locationMatch;
    });
  }, [selectedWorkoutType, selectedLocation]);

  const handleMeetClick = (meetId: string) => {
    console.log("Meet clicked:", meetId);
    // TODO: 상세 페이지로 이동
  };

  const handleCreateMeet = () => {
    console.log("Create meet clicked");
    // TODO: 게시글 작성 페이지로 이동
  };

  return (
    <PageContainer>
      <PageTitle>모집게시판</PageTitle>

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
            <MeetList>
              {filteredMeets.map((meet) => (
                <MeetCard
                  key={meet._id}
                  meet={meet}
                  onClick={() => handleMeetClick(meet._id)}
                />
              ))}
            </MeetList>
          ) : (
            <EmptyState>
              <EmptyIcon>🔍</EmptyIcon>
              <EmptyTitle>검색 결과가 없습니다</EmptyTitle>
              <EmptyDescription>
                다른 필터 조건을 시도해보거나
                <br />
                새로운 모집글을 작성해보세요
              </EmptyDescription>
            </EmptyState>
          )}
        </MeetListSection>
      </ContentWrapper>
    </PageContainer>
  );
}

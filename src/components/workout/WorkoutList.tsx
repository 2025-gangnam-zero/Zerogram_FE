import React from "react";
import styled from "styled-components";
import { UI_CONSTANTS } from "../../constants";
import { WorkoutStatePopulated } from "../../types";
import Button from "../common/Button";

interface WorkoutListProps {
  workouts: WorkoutStatePopulated[];
  isLoading: boolean;
  onWorkoutUpdated: () => void;
  onViewDetail?: (workoutId: string) => void;
}

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${UI_CONSTANTS.SPACING.MD};
`;

const WorkoutCard = styled.div`
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  padding: ${UI_CONSTANTS.SPACING.LG};
  background-color: white;
`;

const WorkoutHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${UI_CONSTANTS.SPACING.MD};

  h3 {
    margin: 0;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  }

  span {
    color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
    font-size: 14px;
  }
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${UI_CONSTANTS.SPACING.XS};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${UI_CONSTANTS.SPACING.SM};
  align-items: center;
`;

const DetailCard = styled.div`
  border-left: 3px solid ${UI_CONSTANTS.COLORS.PRIMARY};
  background-color: ${UI_CONSTANTS.COLORS.LIGHT};
  padding: ${UI_CONSTANTS.SPACING.MD};
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
`;

const WorkoutType = styled.span<{ $type: string }>`
  display: inline-block;
  padding: ${UI_CONSTANTS.SPACING.SM} ${UI_CONSTANTS.SPACING.MD};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
  font-weight: 600;
  font-size: 12px;
  color: white;
  background-color: ${({ $type }) =>
    $type === "running" ? "#e74c3c" : "#9b59b6"};
`;

const DetailInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${UI_CONSTANTS.SPACING.SM};
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;

  label {
    font-size: 11px;
    color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
    margin-bottom: 2px;
  }

  span {
    font-weight: 600;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    font-size: 14px;
  }
`;

const FeedbackSection = styled.div`
  margin-top: ${UI_CONSTANTS.SPACING.SM};
  padding: ${UI_CONSTANTS.SPACING.SM};
  background-color: white;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};

  p {
    margin: 0;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    font-size: 14px;
    line-height: 1.4;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${UI_CONSTANTS.SPACING.XL};
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${UI_CONSTANTS.SPACING.XL};
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

// 초를 분:초 형식으로 변환하는 함수 (330초 -> 5:30)
const secondsToPace = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const WorkoutList: React.FC<WorkoutListProps> = ({
  workouts,
  isLoading,
  onWorkoutUpdated,
  onViewDetail,
}) => {
  if (isLoading) {
    return <LoadingState>운동일지를 불러오는 중...</LoadingState>;
  }

  if (workouts.length === 0) {
    return <EmptyState>선택한 날짜에 운동 기록이 없습니다.</EmptyState>;
  }

  return (
    <ListContainer>
      {workouts.map((workout) => (
        <WorkoutCard key={workout._id}>
          <WorkoutHeader>
            <HeaderInfo>
              <h3>운동일지</h3>
              <span>
                {new Date(workout.createdAt).toLocaleString("ko-KR", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </HeaderInfo>
            <HeaderActions>
              {onViewDetail && (
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => onViewDetail(workout._id)}
                >
                  자세히 보기
                </Button>
              )}
            </HeaderActions>
          </WorkoutHeader>

          {workout.details.map((detail, index) => (
            <DetailCard key={detail._id}>
              <DetailHeader>
                <WorkoutType $type={detail.workout_name}>
                  {detail.workout_name === "running" ? "러닝" : "헬스"}
                </WorkoutType>
                <span>
                  {new Date(detail.createdAt).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </DetailHeader>

              <DetailInfo>
                <InfoItem>
                  <label>총 운동 시간</label>
                  <span>{detail.duration}분</span>
                </InfoItem>
                <InfoItem>
                  <label>총 소모 칼로리</label>
                  <span>{detail.calories}kcal</span>
                </InfoItem>

                {detail.workout_name === "running" && (
                  <>
                    <InfoItem>
                      <label>거리</label>
                      <span>{detail.distance}km</span>
                    </InfoItem>
                    <InfoItem>
                      <label>평균 페이스</label>
                      <span>
                        {detail.avg_pace ? secondsToPace(detail.avg_pace) : "-"}
                      </span>
                    </InfoItem>
                  </>
                )}

                {detail.workout_name === "fitness" && detail.fitnessDetails && (
                  <>
                    {detail.fitnessDetails.map(
                      (fitnessDetail, fitnessIndex) => (
                        <React.Fragment key={fitnessDetail._id || fitnessIndex}>
                          <InfoItem>
                            <label>운동 부위</label>
                            <span>{fitnessDetail.body_part}</span>
                          </InfoItem>
                          <InfoItem>
                            <label>운동 종목</label>
                            <span>{fitnessDetail.fitness_type}</span>
                          </InfoItem>
                          <InfoItem>
                            <label>세트 × 횟수 × 무게</label>
                            <span>
                              {fitnessDetail.sets} × {fitnessDetail.reps} ×{" "}
                              {fitnessDetail.weight}kg
                            </span>
                          </InfoItem>
                        </React.Fragment>
                      )
                    )}
                  </>
                )}
              </DetailInfo>

              {detail.feedback && (
                <FeedbackSection>
                  <p>{detail.feedback}</p>
                </FeedbackSection>
              )}
            </DetailCard>
          ))}
        </WorkoutCard>
      ))}
    </ListContainer>
  );
};

export default WorkoutList;

import React from "react";
import styled from "styled-components";
import { UI_CONSTANTS } from "../../constants";
import { workouts } from "../../types";

interface WorkoutListProps {
  workouts: workouts[];
  isLoading: boolean;
  onWorkoutUpdated: () => void;
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
`;

const WorkoutType = styled.div<{ $type: string }>`
  display: inline-block;
  padding: ${UI_CONSTANTS.SPACING.SM} ${UI_CONSTANTS.SPACING.MD};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
  font-weight: 600;
  font-size: 14px;
  color: white;
  background-color: ${({ $type }) =>
    $type === "running" ? "#e74c3c" : "#9b59b6"};
`;

const WorkoutInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${UI_CONSTANTS.SPACING.MD};
  margin-bottom: ${UI_CONSTANTS.SPACING.MD};
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;

  label {
    font-size: 12px;
    color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
    margin-bottom: 2px;
  }

  span {
    font-weight: 600;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  }
`;

const FitnessDetails = styled.div`
  margin-top: ${UI_CONSTANTS.SPACING.MD};
`;

const ExerciseItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${UI_CONSTANTS.SPACING.SM};
  border-left: 3px solid ${UI_CONSTANTS.COLORS.PRIMARY};
  background-color: ${UI_CONSTANTS.COLORS.LIGHT};
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
`;

const Feedback = styled.div`
  margin-top: ${UI_CONSTANTS.SPACING.MD};
  padding: ${UI_CONSTANTS.SPACING.MD};
  background-color: ${UI_CONSTANTS.COLORS.LIGHT};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};

  p {
    margin: 0;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    line-height: 1.5;
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

const WorkoutList: React.FC<WorkoutListProps> = ({
  workouts,
  isLoading,
  onWorkoutUpdated,
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
            <WorkoutType $type={workout.workout_name}>
              {workout.workout_name === "running" ? "러닝" : "헬스"}
            </WorkoutType>
            <span>
              {new Date(workout.createdAt).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </WorkoutHeader>

          <WorkoutInfo>
            <InfoItem>
              <label>운동 시간</label>
              <span>{workout.duration}분</span>
            </InfoItem>
            <InfoItem>
              <label>소모 칼로리</label>
              <span>{workout.calories}kcal</span>
            </InfoItem>

            {workout.running && (
              <>
                <InfoItem>
                  <label>평균 페이스</label>
                  <span>{workout.running.avg_pace}</span>
                </InfoItem>
                <InfoItem>
                  <label>거리</label>
                  <span>{workout.running.distance}km</span>
                </InfoItem>
              </>
            )}
          </WorkoutInfo>

          {workout.fitness && workout.fitness.length > 0 && (
            <FitnessDetails>
              <h4 style={{ margin: "0 0 12px 0" }}>운동 종목</h4>
              {workout.fitness.map((exercise, index) => (
                <ExerciseItem key={index}>
                  <div>
                    <strong>{exercise.fitness_type}</strong>
                    <span
                      style={{
                        color: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
                        marginLeft: "8px",
                      }}
                    >
                      ({exercise.body_part})
                    </span>
                  </div>
                  <div>
                    {exercise.sets}세트 × {exercise.reps}회 × {exercise.weight}
                    kg
                  </div>
                </ExerciseItem>
              ))}
            </FitnessDetails>
          )}

          {workout.feedback && (
            <Feedback>
              <p>{workout.feedback}</p>
            </Feedback>
          )}
        </WorkoutCard>
      ))}
    </ListContainer>
  );
};

export default WorkoutList;

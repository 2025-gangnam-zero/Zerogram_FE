import React from "react";
import styled from "styled-components";
import Card from "../common/Card";
import { UI_CONSTANTS } from "../../constants";
import { WorkoutStatePopulated } from "../../types";

interface WorkoutLogCardProps {
  workout: WorkoutStatePopulated;
  onClick: () => void;
}

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${UI_CONSTANTS.SPACING.SM};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
`;

const DateText = styled.span`
  font-size: 0.9rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-weight: 500;
`;

const WorkoutBadge = styled.span`
  background: #e74c3c;
  color: white;
  padding: 4px 8px;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
  font-size: 0.8rem;
  font-weight: 600;
`;

const WorkoutSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const WorkoutItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
`;

const WorkoutType = styled.span`
  font-weight: 500;
`;

const WorkoutCalories = styled.span`
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const TotalCalories = styled.div`
  text-align: center;
  font-weight: 600;
  color: #e74c3c;
  font-size: 1.1rem;
  margin-top: ${UI_CONSTANTS.SPACING.SM};
  padding-top: ${UI_CONSTANTS.SPACING.SM};
  border-top: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
`;

const WorkoutLogCard: React.FC<WorkoutLogCardProps> = ({
  workout,
  onClick,
}) => {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  const getTotalCalories = () => {
    return workout.details.reduce(
      (sum, detail) => sum + (detail.calories || 0),
      0
    );
  };

  const totalCalories = getTotalCalories();

  return (
    <Card onClick={onClick}>
      <CardContent>
        <CardHeader>
          <DateText>
            {workout.date
              ? formatDate(workout.date)
              : formatDate(workout.createdAt)}
          </DateText>
          <WorkoutBadge>운동일지</WorkoutBadge>
        </CardHeader>

        <WorkoutSummary>
          {workout.details.map((detail, index) => (
            <WorkoutItem key={detail._id || index}>
              <WorkoutType>
                {detail.workout_name === "running" ? "러닝" : "헬스"}
                {detail.distance && ` (${detail.distance}km)`}
              </WorkoutType>
              <WorkoutCalories>{detail.calories} kcal</WorkoutCalories>
            </WorkoutItem>
          ))}
        </WorkoutSummary>

        <TotalCalories>총 {totalCalories} kcal</TotalCalories>
      </CardContent>
    </Card>
  );
};

export default WorkoutLogCard;

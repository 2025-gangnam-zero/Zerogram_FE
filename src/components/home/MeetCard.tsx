import React from "react";
import styled from "styled-components";
import Card from "../common/Card";
import { UI_CONSTANTS } from "../../constants";
import { Meet } from "../../types/meet";

interface MeetCardProps {
  meet: Meet;
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
  align-items: flex-start;
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin: 0;
  line-height: 1.3;
  flex: 1;
  margin-right: ${UI_CONSTANTS.SPACING.SM};
`;

const WorkoutType = styled.span<{ $type: string }>`
  background: ${(props) =>
    props.$type === "fitness"
      ? UI_CONSTANTS.COLORS.PRIMARY
      : UI_CONSTANTS.COLORS.SUCCESS};
  color: white;
  padding: 4px 8px;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
`;

const Description = styled.p`
  font-size: 0.85rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MetaInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${UI_CONSTANTS.SPACING.SM};
  padding-top: ${UI_CONSTANTS.SPACING.SM};
  border-top: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
`;

const Location = styled.span`
  background: rgba(52, 152, 219, 0.1);
  color: ${UI_CONSTANTS.COLORS.PRIMARY};
  padding: 2px 6px;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
  font-size: 0.75rem;
  font-weight: 500;
`;

const Participants = styled.span`
  font-size: 0.8rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DateText = styled.span`
  font-size: 0.75rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const MeetCard: React.FC<MeetCardProps> = ({ meet, onClick }) => {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  const getWorkoutTypeLabel = (type: string) => {
    return type === "fitness" ? "헬스" : "러닝";
  };

  return (
    <Card onClick={onClick}>
      <CardContent>
        <CardHeader>
          <Title>{meet.title}</Title>
          <WorkoutType $type={meet.workout_type}>
            {getWorkoutTypeLabel(meet.workout_type)}
          </WorkoutType>
        </CardHeader>

        <Description>{meet.description}</Description>

        <MetaInfo>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Location>{meet.location}</Location>
            <Participants>👥 {meet.crews?.length || 0}명</Participants>
          </div>
          <DateText>{formatDate(meet.createdAt)}</DateText>
        </MetaInfo>
      </CardContent>
    </Card>
  );
};

export default MeetCard;

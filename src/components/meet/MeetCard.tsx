import React from "react";
import styled from "styled-components";
import { Meet } from "../../types/meet";
import { UI_CONSTANTS } from "../../constants";

interface MeetCardProps {
  meet: Meet;
  onClick?: () => void;
}

const CardContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    border-color: ${UI_CONSTANTS.COLORS.PRIMARY};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin: 0;
  line-height: 1.4;
  flex: 1;
  margin-right: 12px;
`;

const WorkoutType = styled.span<{ $type: string }>`
  background: ${(props) =>
    props.$type === "fitness"
      ? UI_CONSTANTS.COLORS.PRIMARY
      : UI_CONSTANTS.COLORS.SUCCESS};
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
`;

const Description = styled.p`
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Author = styled.span`
  font-size: 0.85rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-weight: 500;
`;

const Location = styled.span`
  font-size: 0.8rem;
  color: ${UI_CONSTANTS.COLORS.PRIMARY};
  background: rgba(52, 152, 219, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
`;

const Stats = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const StatIcon = styled.span`
  font-size: 0.9rem;
`;

const Date = styled.span`
  font-size: 0.8rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const MeetCard: React.FC<MeetCardProps> = ({ meet, onClick }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getWorkoutTypeLabel = (type: string) => {
    return type === "fitness" ? "헬스" : "러닝";
  };

  return (
    <CardContainer onClick={onClick}>
      <CardHeader>
        <Title>{meet.title}</Title>
        <WorkoutType $type={meet.workout_type}>
          {getWorkoutTypeLabel(meet.workout_type)}
        </WorkoutType>
      </CardHeader>

      <Description>{meet.description}</Description>

      <CardFooter>
        <AuthorInfo>
          <Author>{meet.nickname}</Author>
          <Location>{meet.location}</Location>
        </AuthorInfo>

        <Stats>
          <StatItem>
            <StatIcon>👥</StatIcon>
            <span>{meet.crews.length}명</span>
          </StatItem>
          <StatItem>
            <StatIcon>💬</StatIcon>
            <span>{meet.comments.length}</span>
          </StatItem>
          <Date>{formatDate(meet.createdAt)}</Date>
        </Stats>
      </CardFooter>
    </CardContainer>
  );
};

export default MeetCard;

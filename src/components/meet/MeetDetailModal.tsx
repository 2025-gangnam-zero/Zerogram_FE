import React, { useState } from "react";
import styled from "styled-components";
import { Meet } from "../../types/meet";
import { UI_CONSTANTS } from "../../constants";
import Button from "../common/Button";
import Input from "../common/Input";

interface MeetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  meet: Meet | null;
  onJoin?: (meetId: string) => void;
  onLeave?: (meetId: string) => void;
  onAddComment?: (meetId: string, content: string) => void;
  isJoined?: boolean;
  isLoading?: boolean;
}

const ModalContent = styled.div`
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const MeetHeader = styled.div`
  border-bottom: 1px solid #e1e5e9;
  padding-bottom: 20px;
  margin-bottom: 20px;
`;

const MeetTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin: 0 0 12px 0;
  line-height: 1.4;
`;

const MeetMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const WorkoutType = styled.span<{ $type: string }>`
  background: ${(props) =>
    props.$type === "fitness"
      ? UI_CONSTANTS.COLORS.PRIMARY
      : UI_CONSTANTS.COLORS.SUCCESS};
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const Location = styled.span`
  background: rgba(52, 152, 219, 0.1);
  color: ${UI_CONSTANTS.COLORS.PRIMARY};
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-size: 0.9rem;
`;

const Date = styled.span`
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-size: 0.9rem;
`;

const MeetDescription = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  line-height: 1.6;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  font-size: 1rem;
  white-space: pre-wrap;
`;

const ActionSection = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const JoinButton = styled(Button)<{ $isJoined: boolean }>`
  background: ${(props) =>
    props.$isJoined
      ? UI_CONSTANTS.COLORS.SUCCESS
      : UI_CONSTANTS.COLORS.PRIMARY};

  &:hover {
    background: ${(props) =>
      props.$isJoined
        ? UI_CONSTANTS.COLORS.SUCCESS
        : UI_CONSTANTS.COLORS.PRIMARY_HOVER};
  }
`;

const ParticipantsSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ParticipantsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Participant = styled.div`
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CommentsSection = styled.div`
  border-top: 1px solid #e1e5e9;
  padding-top: 24px;
`;

const CommentForm = styled.form`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const CommentInput = styled(Input)`
  flex: 1;
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CommentItem = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid ${UI_CONSTANTS.COLORS.PRIMARY};
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const CommentAuthor = styled.span`
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  font-size: 0.9rem;
`;

const CommentDate = styled.span`
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-size: 0.8rem;
`;

const CommentContent = styled.p`
  margin: 0;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  line-height: 1.5;
  white-space: pre-wrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 1rem;
`;

const MeetDetailModal: React.FC<MeetDetailModalProps> = ({
  isOpen,
  onClose,
  meet,
  onJoin,
  onLeave,
  onAddComment,
  isJoined = false,
  isLoading = false,
}) => {
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getWorkoutTypeLabel = (type: string) => {
    return type === "fitness" ? "헬스" : "러닝";
  };

  const handleJoinClick = () => {
    if (!meet) return;

    if (isJoined) {
      onLeave?.(meet._id);
    } else {
      onJoin?.(meet._id);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!meet || !commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);

    try {
      await onAddComment?.(meet._id, commentText.trim());
      setCommentText("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (!meet) return null;

  return (
    <ModalContent>
      <MeetHeader>
        <MeetTitle>{meet.title}</MeetTitle>

        <MeetMeta>
          <WorkoutType $type={meet.workout_type}>
            {getWorkoutTypeLabel(meet.workout_type)}
          </WorkoutType>
          <Location>{meet.location}</Location>
          <AuthorInfo>
            <span>👤</span>
            <span>{meet.nickname}</span>
          </AuthorInfo>
          <Date>{formatDate(meet.createdAt)}</Date>
        </MeetMeta>
      </MeetHeader>

      <MeetDescription>{meet.description}</MeetDescription>

      <ActionSection>
        <JoinButton
          variant="primary"
          onClick={handleJoinClick}
          disabled={isLoading}
          $isJoined={isJoined}
        >
          {isLoading ? "처리 중..." : isJoined ? "참여 취소" : "참여하기"}
        </JoinButton>
      </ActionSection>

      <ParticipantsSection>
        <SectionTitle>👥 참여자 ({meet.crews.length}명)</SectionTitle>
        <ParticipantsList>
          {meet.crews.map((crew, index) => (
            <Participant key={index}>
              <span>👤</span>
              <span>{crew.nickname}</span>
            </Participant>
          ))}
        </ParticipantsList>
      </ParticipantsSection>

      <CommentsSection>
        <SectionTitle>💬 댓글 ({meet.comments.length}개)</SectionTitle>

        <CommentForm onSubmit={handleCommentSubmit}>
          <CommentInput
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글을 입력해주세요..."
            disabled={isSubmittingComment}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!commentText.trim() || isSubmittingComment}
          >
            {isSubmittingComment ? "등록 중..." : "등록"}
          </Button>
        </CommentForm>

        <CommentsList>
          {meet.comments.length > 0 ? (
            meet.comments.map((comment) => (
              <CommentItem key={comment._id}>
                <CommentHeader>
                  <CommentAuthor>{comment.nickname}</CommentAuthor>
                  <CommentDate>{formatDate(comment.createdAt)}</CommentDate>
                </CommentHeader>
                <CommentContent>{comment.content}</CommentContent>
              </CommentItem>
            ))
          ) : (
            <EmptyState>
              <EmptyIcon>💬</EmptyIcon>
              <EmptyText>
                아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
              </EmptyText>
            </EmptyState>
          )}
        </CommentsList>
      </CommentsSection>
    </ModalContent>
  );
};

export default MeetDetailModal;

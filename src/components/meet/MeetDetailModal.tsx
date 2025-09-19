import React, { useState } from "react";
import styled from "styled-components";
import { Meet, Comment as MeetComment } from "../../types/meet";
import { UI_CONSTANTS } from "../../constants";
import Button from "../common/Button";
import Input from "../common/Input";
import ImageUpload from "./ImageUpload";
import { useUserStore } from "../../store/userStore";

type Comment = MeetComment;

interface MeetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  meet: Meet | null | undefined;
  onJoin?: (meetId: string) => void;
  onLeave?: (meetId: string) => void;
  onAddComment?: (meetId: string, content: string) => void;
  onUpdateMeet?: (
    meetId: string,
    data: {
      title: string;
      description: string;
      images?: string[];
      newImages?: File[];
      existingImages?: string[];
    }
  ) => void;
  onUpdateComment?: (
    meetId: string,
    commentId: string,
    content: string
  ) => void;
  onDeleteMeet?: (meetId: string) => void;
  onDeleteComment?: (meetId: string, commentId: string) => void;
  isJoined?: boolean;
  isLoading?: boolean;
}

const ModalContent = styled.div`
  max-width: 800px;
  width: 100%;
  overflow: visible;
  position: relative;
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

const ProfileImage = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e1e5e9;
`;

const DefaultProfileIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${UI_CONSTANTS.COLORS.PRIMARY};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
`;

const DateText = styled.span`
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-size: 0.9rem;
`;

// formatDate 함수를 컴포넌트 외부로 이동하여 Date 충돌 방지
const formatDate = (date: Date | string | null | undefined) => {
  try {
    // date가 없으면 기본값 반환
    if (!date) {
      return "날짜 정보 없음";
    }

    let dateObj: Date;

    if (typeof date === "string") {
      // 문자열을 Date 객체로 변환
      const timestamp = globalThis.Date.parse(date);
      if (isNaN(timestamp)) {
        return "날짜 정보 없음";
      }
      dateObj = new globalThis.Date(timestamp);
    } else {
      dateObj = date;
    }

    // dateObj가 유효한지 확인
    if (!dateObj || typeof dateObj.getTime !== "function") {
      return "날짜 정보 없음";
    }

    // 유효한 날짜인지 확인
    if (isNaN(dateObj.getTime())) {
      return "날짜 정보 없음";
    }

    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "날짜 정보 없음";
  }
};

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

const CommentAuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CommentProfileImage = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e1e5e9;
`;

const CommentDefaultProfileIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${UI_CONSTANTS.COLORS.PRIMARY};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: 600;
`;

const ParticipantProfileImage = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e1e5e9;
`;

const ParticipantDefaultProfileIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${UI_CONSTANTS.COLORS.PRIMARY};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: 600;
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

const EditText = styled.span`
  color: ${UI_CONSTANTS.COLORS.PRIMARY};
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:hover {
    color: ${UI_CONSTANTS.COLORS.PRIMARY_HOVER};
  }
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  overflow: visible;
  min-height: 0;
`;

const EditInput = styled(Input)`
  font-size: 1rem;
`;

const EditTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:focus {
    border-color: ${UI_CONSTANTS.COLORS.PRIMARY};
  }
`;

const EditActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  background: transparent;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  border: 1px solid #e1e5e9;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:hover {
    background: #f8f9fa;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  }
`;

const SaveButton = styled.button`
  background: ${UI_CONSTANTS.COLORS.PRIMARY};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:hover {
    background: ${UI_CONSTANTS.COLORS.PRIMARY_HOVER};
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ImagesSection = styled.div`
  margin-bottom: 24px;
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const ImageItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e1e5e9;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:hover {
    transform: scale(1.05);
  }
`;

const MeetDetailModal: React.FC<MeetDetailModalProps> = ({
  isOpen,
  onClose,
  meet,
  onJoin,
  onLeave,
  onAddComment,
  onUpdateMeet,
  onUpdateComment,
  onDeleteMeet,
  onDeleteComment,
  isJoined = false,
  isLoading = false,
}) => {
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isEditingMeet, setIsEditingMeet] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editMeetTitle, setEditMeetTitle] = useState("");
  const [editMeetDescription, setEditMeetDescription] = useState("");
  const [editCommentContent, setEditCommentContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editNewImages, setEditNewImages] = useState<File[]>([]);
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);

  // 현재 사용자 정보 가져오기
  const { id: currentUserId } = useUserStore();

  // meet이 없으면 모달을 렌더링하지 않음
  if (!meet) {
    return null;
  }

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

  const handleEditMeet = () => {
    if (!meet) return;
    setEditMeetTitle(meet.title);
    setEditMeetDescription(meet.description);
    setEditImages(meet.images || []); // 유지할 이미지들
    setEditExistingImages([]); // 삭제할 이미지들 (초기에는 빈 배열)
    setEditNewImages([]); // 새로 추가할 이미지들
    setIsEditingMeet(true);
  };

  const handleCancelEditMeet = () => {
    setIsEditingMeet(false);
    setEditMeetTitle("");
    setEditMeetDescription("");
    setEditImages([]);
    setEditExistingImages([]);
    setEditNewImages([]);
  };

  const handleSaveMeet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !meet ||
      !editMeetTitle.trim() ||
      !editMeetDescription.trim() ||
      isUpdating
    )
      return;

    setIsUpdating(true);
    try {
      console.log("게시글 수정 데이터:", {
        title: editMeetTitle.trim(),
        description: editMeetDescription.trim(),
        images: editImages, // 유지할 이미지들
        newImages: editNewImages, // 새로 추가할 이미지들
        existingImages: editExistingImages, // 삭제할 이미지들
      });

      await onUpdateMeet?.(meet._id, {
        title: editMeetTitle.trim(),
        description: editMeetDescription.trim(),
        images: editImages,
        newImages: editNewImages,
        existingImages: editExistingImages,
      });
      setIsEditingMeet(false);
    } catch (error) {
      console.error("Failed to update meet:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditCommentContent(comment.content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentContent("");
  };

  const handleSaveComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meet || !editingCommentId || !editCommentContent.trim() || isUpdating)
      return;

    setIsUpdating(true);
    try {
      await onUpdateComment?.(
        meet._id,
        editingCommentId,
        editCommentContent.trim()
      );
      setEditingCommentId(null);
      setEditCommentContent("");
    } catch (error) {
      console.error("Failed to update comment:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 현재 사용자가 작성자인지 확인하는 함수
  const isCurrentUser = (userId: string): boolean => {
    return userId === currentUserId;
  };

  const handleEditImagesChange = (newImages: string[]) => {
    // blob URL을 제외한 실제 이미지 URL만 필터링
    const actualImages = newImages.filter((img) => !img.startsWith("blob:"));
    setEditImages(actualImages);

    // 원본 이미지에서 현재 선택된 이미지를 제외한 나머지를 삭제할 이미지로 설정
    if (meet && meet.images) {
      const deletedImages = meet.images.filter(
        (img) => !actualImages.includes(img)
      );
      setEditExistingImages(deletedImages);

      console.log("이미지 변경:", {
        원본이미지: meet.images,
        선택된이미지: newImages,
        실제이미지: actualImages,
        삭제할이미지: deletedImages,
      });
    }
  };

  const handleEditNewImagesChange = (files: File[]) => {
    setEditNewImages(files);
  };

  const handleEditExistingImagesChange = (urls: string[]) => {
    setEditExistingImages((prev) => {
      // 중복 제거하여 추가
      const newUrls = urls.filter((url) => !prev.includes(url));
      return [...prev, ...newUrls];
    });
  };

  const handleDeleteMeet = async () => {
    if (!meet || !onDeleteMeet) return;

    if (window.confirm("정말로 이 모집글을 삭제하시겠습니까?")) {
      try {
        await onDeleteMeet(meet._id);
        onClose();
      } catch (error) {
        console.error("Failed to delete meet:", error);
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!meet || !onDeleteComment) return;

    if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      try {
        await onDeleteComment(meet._id, commentId);
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
    }
  };

  // 프로필 이미지 렌더링 함수
  const renderProfileImage = (
    profileImage?: string,
    nickname?: string,
    size: "small" | "medium" = "medium"
  ) => {
    const isSmall = size === "small";
    const ImageComponent = isSmall ? CommentProfileImage : ProfileImage;
    const DefaultComponent = isSmall
      ? CommentDefaultProfileIcon
      : DefaultProfileIcon;

    if (profileImage) {
      return <ImageComponent src={profileImage} alt={nickname || "Profile"} />;
    }

    return (
      <DefaultComponent>
        {nickname ? nickname.charAt(0).toUpperCase() : "?"}
      </DefaultComponent>
    );
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
            {renderProfileImage(meet.profile_image, meet.nickname)}
            <span>{meet.nickname}</span>
            {isCurrentUser(meet.userId) && (
              <div style={{ display: "flex", gap: "8px" }}>
                <EditText onClick={handleEditMeet}>수정하기</EditText>
                <EditText
                  onClick={handleDeleteMeet}
                  style={{ color: "#e74c3c" }}
                >
                  삭제하기
                </EditText>
              </div>
            )}
          </AuthorInfo>
          <DateText>{formatDate(meet.createdAt)}</DateText>
        </MeetMeta>
      </MeetHeader>

      {isEditingMeet ? (
        <EditForm onSubmit={handleSaveMeet}>
          <EditInput
            type="text"
            value={editMeetTitle}
            onChange={(e) => setEditMeetTitle(e.target.value)}
            placeholder="제목을 입력해주세요"
            disabled={isUpdating}
          />
          <EditTextarea
            value={editMeetDescription}
            onChange={(e) => setEditMeetDescription(e.target.value)}
            placeholder="내용을 입력해주세요"
            disabled={isUpdating}
          />
          <ImageUpload
            images={editImages}
            onImagesChange={handleEditImagesChange}
            onNewImagesChange={handleEditNewImagesChange}
            onExistingImagesChange={handleEditExistingImagesChange}
            onPreviewImagesChange={(previewUrls) => {
              // 미리보기 URL들은 별도로 관리 (서버 전송 안함)
              console.log("미리보기 이미지들:", previewUrls);
            }}
            maxImages={10}
            disabled={isUpdating}
          />
          <EditActions>
            <CancelButton
              type="button"
              onClick={handleCancelEditMeet}
              disabled={isUpdating}
            >
              취소
            </CancelButton>
            <SaveButton
              type="submit"
              disabled={
                !editMeetTitle.trim() ||
                !editMeetDescription.trim() ||
                isUpdating
              }
            >
              {isUpdating ? "저장 중..." : "저장"}
            </SaveButton>
          </EditActions>
        </EditForm>
      ) : (
        <MeetDescription>{meet.description}</MeetDescription>
      )}

      {!isEditingMeet && meet.images && meet.images.length > 0 && (
        <ImagesSection>
          <SectionTitle>📷 첨부 이미지 ({meet.images.length}개)</SectionTitle>
          <ImagesGrid>
            {meet.images.map((image, index) => (
              <ImageItem key={`image-${image}-${index}`}>
                <Image
                  src={image}
                  alt={`첨부 이미지 ${index + 1}`}
                  onClick={() => window.open(image, "_blank")}
                />
              </ImageItem>
            ))}
          </ImagesGrid>
        </ImagesSection>
      )}

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
        <SectionTitle>👥 참여자 ({meet.crews?.length || 0}명)</SectionTitle>
        <ParticipantsList>
          {meet.crews && meet.crews.length > 0
            ? meet.crews.map((crew, index) => (
                <Participant key={`${crew.userId}-${index}`}>
                  {crew.profile_image ? (
                    <ParticipantProfileImage
                      src={crew.profile_image}
                      alt={crew.nickname}
                    />
                  ) : (
                    <ParticipantDefaultProfileIcon>
                      {crew.nickname.charAt(0).toUpperCase()}
                    </ParticipantDefaultProfileIcon>
                  )}
                  <span>{crew.nickname}</span>
                </Participant>
              ))
            : null}
        </ParticipantsList>
      </ParticipantsSection>

      <CommentsSection>
        <SectionTitle>💬 댓글 ({meet.comments?.length || 0}개)</SectionTitle>

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
          {meet.comments && meet.comments.length > 0 ? (
            meet.comments.map((comment, index) => (
              <CommentItem
                key={comment._id || `comment-${comment.userId}-${index}`}
              >
                <CommentHeader>
                  <CommentAuthorInfo>
                    {renderProfileImage(
                      comment.profile_image,
                      comment.nickname,
                      "small"
                    )}
                    <CommentAuthor>{comment.nickname}</CommentAuthor>
                  </CommentAuthorInfo>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CommentDate>{formatDate(comment.createdAt)}</CommentDate>
                    {isCurrentUser(comment.userId) && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <EditText onClick={() => handleEditComment(comment)}>
                          수정하기
                        </EditText>
                        <EditText
                          onClick={() => handleDeleteComment(comment._id)}
                          style={{ color: "#e74c3c" }}
                        >
                          삭제하기
                        </EditText>
                      </div>
                    )}
                  </div>
                </CommentHeader>
                {editingCommentId === comment._id ? (
                  <EditForm onSubmit={handleSaveComment}>
                    <EditTextarea
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                      placeholder="댓글을 입력해주세요"
                      disabled={isUpdating}
                    />
                    <EditActions>
                      <CancelButton
                        type="button"
                        onClick={handleCancelEditComment}
                        disabled={isUpdating}
                      >
                        취소
                      </CancelButton>
                      <SaveButton
                        type="submit"
                        disabled={!editCommentContent.trim() || isUpdating}
                      >
                        {isUpdating ? "저장 중..." : "저장"}
                      </SaveButton>
                    </EditActions>
                  </EditForm>
                ) : (
                  <CommentContent>{comment.content}</CommentContent>
                )}
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

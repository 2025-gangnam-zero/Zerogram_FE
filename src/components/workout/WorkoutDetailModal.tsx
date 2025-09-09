import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { UI_CONSTANTS } from "../../constants";
import {
  WorkoutStatePopulated,
  CreateWorkoutDetailRequest,
  WorkoutDetailType,
} from "../../types";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import {
  addWorkoutDetailApi,
  updateWorkoutDetailApi,
  deleteWorkoutDetailApi,
  deleteWorkoutApi,
  deleteFitnessDetailApi,
} from "../../api/workout";

interface WorkoutDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: WorkoutStatePopulated | null;
  onWorkoutUpdated: () => void;
}

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${UI_CONSTANTS.SPACING.LG};
`;

const WorkoutInfo = styled.div`
  background-color: ${UI_CONSTANTS.COLORS.LIGHT};
  padding: ${UI_CONSTANTS.SPACING.MD};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  border-left: 3px solid ${UI_CONSTANTS.COLORS.PRIMARY};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${UI_CONSTANTS.SPACING.SM};
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
`;

const InfoItem = styled.div`
  label {
    font-size: 12px;
    color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
    display: block;
    margin-bottom: 2px;
  }

  span {
    font-weight: 600;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  }
`;

const DetailSection = styled.div`
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  padding: ${UI_CONSTANTS.SPACING.MD};
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${UI_CONSTANTS.SPACING.MD};
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

const ButtonGroup = styled.div`
  display: flex;
  gap: ${UI_CONSTANTS.SPACING.SM};
`;

const EditForm = styled.div`
  background-color: ${UI_CONSTANTS.COLORS.LIGHT};
  padding: ${UI_CONSTANTS.SPACING.MD};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
  margin-top: ${UI_CONSTANTS.SPACING.SM};
  border: 2px solid ${UI_CONSTANTS.COLORS.PRIMARY};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${UI_CONSTANTS.SPACING.MD};
  margin-bottom: ${UI_CONSTANTS.SPACING.MD};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  font-family: inherit;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: ${UI_CONSTANTS.COLORS.PRIMARY};
  }
`;

const ConfirmDialog = styled.div`
  background-color: white;
  padding: ${UI_CONSTANTS.SPACING.LG};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  box-shadow: ${UI_CONSTANTS.SHADOWS.LG};
  text-align: center;

  h4 {
    margin: 0 0 ${UI_CONSTANTS.SPACING.MD} 0;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  }

  p {
    margin: 0 0 ${UI_CONSTANTS.SPACING.LG} 0;
    color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  }
`;

const DeleteActions = styled.div`
  border-top: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  padding-top: ${UI_CONSTANTS.SPACING.MD};
  margin-top: ${UI_CONSTANTS.SPACING.LG};
`;

const FitnessDetailContainer = styled.div`
  background-color: ${UI_CONSTANTS.COLORS.LIGHT};
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
  padding: ${UI_CONSTANTS.SPACING.MD};
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
  position: relative;
`;

const FitnessDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
`;

const FitnessDetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${UI_CONSTANTS.SPACING.SM};
`;

// 페이스를 초로 변환하는 함수
const paceToSeconds = (pace: string): number => {
  const parts = pace.split(":");
  if (parts.length !== 2) return 0;
  const minutes = parseInt(parts[0]) || 0;
  const seconds = parseInt(parts[1]) || 0;
  return minutes * 60 + seconds;
};

// 초를 분:초 형식으로 변환하는 함수
const secondsToPace = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  isOpen,
  onClose,
  workout,
  onWorkoutUpdated,
}) => {
  const [editingDetailId, setEditingDetailId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    type: "detail" | "workout" | "fitness";
    id: string;
  } | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newFitnessDetails, setNewFitnessDetails] = useState<any[]>([]);

  // 편집 폼 상태
  const [editForm, setEditForm] = useState({
    workout_name: "running" as "running" | "fitness",
    duration: 0,
    calories: 0,
    feedback: "",
    distance: 0,
    avg_pace: "",
    fitnessDetails: [
      { body_part: "", fitness_type: "", sets: 0, reps: 0, weight: 0 },
    ],
  });

  // 편집 모드에서 기존 루틴 개수를 추적
  const [originalFitnessCount, setOriginalFitnessCount] = useState(0);

  useEffect(() => {
    if (editingDetailId && workout) {
      const detail = workout.details.find((d) => d._id === editingDetailId);
      if (detail) {
        setEditForm({
          workout_name: detail.workout_name,
          duration: detail.duration,
          calories: detail.calories,
          feedback: detail.feedback || "",
          distance: detail.distance || 0,
          avg_pace: detail.avg_pace ? secondsToPace(detail.avg_pace) : "",
          fitnessDetails: detail.fitnessDetails?.length
            ? detail.fitnessDetails.map((f) => ({
                body_part: f.body_part || "",
                fitness_type: f.fitness_type || "",
                sets: f.sets || 0,
                reps: f.reps || 0,
                weight: f.weight || 0,
              }))
            : [
                {
                  body_part: "",
                  fitness_type: "",
                  sets: 0,
                  reps: 0,
                  weight: 0,
                },
              ],
        });
        // 편집 모드 진입 시 기존 루틴 개수 저장 및 새로 추가될 항목들을 빈 배열로 초기화
        setOriginalFitnessCount(detail.fitnessDetails?.length || 0);
        setNewFitnessDetails([]);
      }
    } else if (isAddingNew) {
      setEditForm({
        workout_name: "running",
        duration: 0,
        calories: 0,
        feedback: "",
        distance: 0,
        avg_pace: "",
        fitnessDetails: [
          { body_part: "", fitness_type: "", sets: 0, reps: 0, weight: 0 },
        ],
      });
      // 새로 추가 모드 진입 시 editForm.fitnessDetails와 동기화
      setOriginalFitnessCount(0);
      setNewFitnessDetails([
        { body_part: "", fitness_type: "", sets: 0, reps: 0, weight: 0 },
      ]);
    }
  }, [editingDetailId, isAddingNew, workout]);

  const handleSaveEdit = async () => {
    console.log("handleSaveEdit 호출됨!");
    console.log("editingDetailId:", editingDetailId);
    console.log("isAddingNew:", isAddingNew);
    console.log("workout:", workout);

    if (!workout) return;

    setIsLoading(true);
    try {
      if (editingDetailId) {
        // 수정의 경우: CreateWorkoutDetailRequest와 동일한 구조 사용
        const updateData: Partial<CreateWorkoutDetailRequest> = {
          workout_name: editForm.workout_name,
          duration: editForm.duration,
          calories: editForm.calories,
          feedback: editForm.feedback,
        };

        if (editForm.workout_name === "running") {
          updateData.distance = editForm.distance;
          updateData.avg_pace = paceToSeconds(editForm.avg_pace);
        } else if (editForm.workout_name === "fitness") {
          // 헬스의 경우 새로 추가된 fitnessDetails만 전송
          const validNewDetails = newFitnessDetails.filter(
            (f) => f.body_part && f.fitness_type && f.sets >= 0 && f.reps >= 0
          );
          updateData.fitnessDetails = validNewDetails;
        }

        console.log("updateData:", updateData);
        console.log("newFitnessDetails:", newFitnessDetails);

        await updateWorkoutDetailApi(workout._id, editingDetailId, updateData);
      } else if (isAddingNew) {
        // 추가의 경우: CreateWorkoutDetailRequest 형태 사용
        const createData: CreateWorkoutDetailRequest = {
          workout_name: editForm.workout_name,
          duration: editForm.duration,
          calories: editForm.calories,
          feedback: editForm.feedback,
        };

        if (editForm.workout_name === "running") {
          createData.distance = editForm.distance;
          createData.avg_pace = paceToSeconds(editForm.avg_pace);
        } else {
          // 새로 추가 모드에서는 editForm.fitnessDetails 사용
          createData.fitnessDetails = editForm.fitnessDetails.filter(
            (f) => f.body_part && f.fitness_type && f.sets >= 0 && f.reps >= 0
          );
        }

        await addWorkoutDetailApi(workout._id, createData);
      }

      setEditingDetailId(null);
      setIsAddingNew(false);
      setNewFitnessDetails([]); // 새로 추가된 항목 초기화
      onWorkoutUpdated();
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!workout || !showDeleteConfirm) return;

    setIsLoading(true);
    try {
      if (showDeleteConfirm.type === "detail") {
        await deleteWorkoutDetailApi(workout._id, showDeleteConfirm.id);
        onWorkoutUpdated();
      } else if (showDeleteConfirm.type === "fitness") {
        await deleteFitnessDetailApi(showDeleteConfirm.id);
        onWorkoutUpdated();
      } else {
        await deleteWorkoutApi(workout._id);
        onWorkoutUpdated();
        onClose();
      }
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateEditForm = (field: string, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));

    // 운동 타입을 헬스로 변경할 때 newFitnessDetails 초기화
    if (field === "workout_name" && value === "fitness") {
      if (isAddingNew) {
        setNewFitnessDetails([
          { body_part: "", fitness_type: "", sets: 0, reps: 0, weight: 0 },
        ]);
      } else if (editingDetailId) {
        setNewFitnessDetails([]);
      }
    }
    // 러닝으로 변경할 때는 빈 배열로 초기화
    else if (field === "workout_name" && value === "running") {
      setNewFitnessDetails([]);
    }
  };

  const updateFitnessDetail = (index: number, field: string, value: any) => {
    setEditForm((prev) => ({
      ...prev,
      fitnessDetails: prev.fitnessDetails.map((detail, i) =>
        i === index ? { ...detail, [field]: value } : detail
      ),
    }));

    // 새로 추가 모드인 경우 newFitnessDetails도 동기화
    if (isAddingNew) {
      setNewFitnessDetails((prev) =>
        prev.map((detail, i) =>
          i === index ? { ...detail, [field]: value } : detail
        )
      );
    }
    // 편집 모드에서 새로 추가된 루틴만 newFitnessDetails에서 업데이트
    else if (editingDetailId && index >= originalFitnessCount) {
      const newIndex = index - originalFitnessCount;
      setNewFitnessDetails((prev) => {
        const newDetails = [...prev];
        if (newIndex < newDetails.length) {
          newDetails[newIndex] = { ...newDetails[newIndex], [field]: value };
        }
        return newDetails;
      });
    }
  };

  const addFitnessDetail = () => {
    const newDetail = {
      body_part: "",
      fitness_type: "",
      sets: 0,
      reps: 0,
      weight: 0,
    };
    setEditForm((prev) => ({
      ...prev,
      fitnessDetails: [...prev.fitnessDetails, newDetail],
    }));

    // 새로 추가 모드인 경우 전체 리스트에 추가
    if (isAddingNew) {
      setNewFitnessDetails((prev) => [...prev, newDetail]);
    }
    // 편집 모드인 경우 새로 추가되는 루틴으로 추가
    else if (editingDetailId) {
      setNewFitnessDetails((prev) => [...prev, newDetail]);
    }
  };

  const removeFitnessDetail = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      fitnessDetails: prev.fitnessDetails.filter((_, i) => i !== index),
    }));

    // 새로 추가 모드인 경우
    if (isAddingNew) {
      setNewFitnessDetails((prev) => prev.filter((_, i) => i !== index));
    }
    // 편집 모드에서 새로 추가된 루틴만 제거
    else if (editingDetailId && index >= originalFitnessCount) {
      const newIndex = index - originalFitnessCount;
      setNewFitnessDetails((prev) => prev.filter((_, i) => i !== newIndex));
    }
  };

  if (!workout) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="운동일지 상세 관리">
      <ModalContent>
        {/* 운동일지 기본 정보 */}
        <WorkoutInfo>
          <h4 style={{ margin: "0 0 12px 0" }}>운동일지 정보</h4>
          <InfoGrid>
            <InfoItem>
              <label>생성일</label>
              <span>
                {new Date(workout.createdAt).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </InfoItem>
            <InfoItem>
              <label>총 운동 세션</label>
              <span>{workout.details.length}개</span>
            </InfoItem>
          </InfoGrid>
        </WorkoutInfo>

        {/* 운동 세부사항들 */}
        <div>
          <h4 style={{ margin: "0 0 16px 0" }}>운동 세부사항</h4>

          {workout.details.map((detail) => (
            <DetailSection key={detail._id}>
              <DetailHeader>
                <WorkoutType $type={detail.workout_name}>
                  {detail.workout_name === "running" ? "러닝" : "헬스"}
                </WorkoutType>
                <ButtonGroup>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => {
                      console.log("편집 모드 활성화:", detail._id);
                      setEditingDetailId(detail._id);
                    }}
                  >
                    수정
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() =>
                      setShowDeleteConfirm({ type: "detail", id: detail._id })
                    }
                  >
                    삭제
                  </Button>
                </ButtonGroup>
              </DetailHeader>

              {editingDetailId === detail._id ? (
                <EditForm>
                  <FormGrid>
                    <Input
                      label="운동 시간 (분)"
                      type="number"
                      value={editForm.duration.toString()}
                      onChange={(e) =>
                        updateEditForm("duration", Number(e.target.value))
                      }
                      min="0"
                    />
                    <Input
                      label="소모 칼로리"
                      type="number"
                      value={editForm.calories.toString()}
                      onChange={(e) =>
                        updateEditForm("calories", Number(e.target.value))
                      }
                      min="0"
                    />

                    {editForm.workout_name === "running" && (
                      <>
                        <Input
                          label="거리 (km)"
                          type="number"
                          value={editForm.distance.toString()}
                          onChange={(e) =>
                            updateEditForm("distance", Number(e.target.value))
                          }
                          min="0"
                          step="0.1"
                        />
                        <Input
                          label="평균 페이스 (분:초/km)"
                          type="text"
                          value={editForm.avg_pace}
                          onChange={(e) =>
                            updateEditForm("avg_pace", e.target.value)
                          }
                          placeholder="예: 5:30"
                        />
                      </>
                    )}
                  </FormGrid>

                  {editForm.workout_name === "fitness" && (
                    <div>
                      <h5 style={{ margin: "0 0 12px 0" }}>운동 루틴</h5>
                      {editForm.fitnessDetails.map((routine, index) => (
                        <div
                          key={index}
                          style={{
                            marginBottom: "12px",
                            padding: "12px",
                            backgroundColor: "white",
                            borderRadius: "8px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "8px",
                            }}
                          >
                            <strong>루틴 {index + 1}</strong>
                            {editForm.fitnessDetails.length > 1 && (
                              <Button
                                variant="danger"
                                size="small"
                                onClick={() => removeFitnessDetail(index)}
                              >
                                삭제
                              </Button>
                            )}
                          </div>
                          <FormGrid>
                            <Input
                              label="운동 부위"
                              type="text"
                              value={routine.body_part}
                              onChange={(e) =>
                                updateFitnessDetail(
                                  index,
                                  "body_part",
                                  e.target.value
                                )
                              }
                              placeholder="예: 가슴, 등, 다리"
                            />
                            <Input
                              label="운동 종목"
                              type="text"
                              value={routine.fitness_type}
                              onChange={(e) =>
                                updateFitnessDetail(
                                  index,
                                  "fitness_type",
                                  e.target.value
                                )
                              }
                              placeholder="예: 벤치프레스, 스쿼트"
                            />
                            <Input
                              label="세트 수"
                              type="number"
                              value={routine.sets.toString()}
                              onChange={(e) =>
                                updateFitnessDetail(
                                  index,
                                  "sets",
                                  Number(e.target.value)
                                )
                              }
                              min="0"
                            />
                            <Input
                              label="횟수"
                              type="number"
                              value={routine.reps.toString()}
                              onChange={(e) =>
                                updateFitnessDetail(
                                  index,
                                  "reps",
                                  Number(e.target.value)
                                )
                              }
                              min="0"
                            />
                            <Input
                              label="무게 (kg)"
                              type="number"
                              value={routine.weight.toString()}
                              onChange={(e) =>
                                updateFitnessDetail(
                                  index,
                                  "weight",
                                  Number(e.target.value)
                                )
                              }
                              min="0"
                              step="0.1"
                            />
                          </FormGrid>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="small"
                        onClick={addFitnessDetail}
                      >
                        루틴 추가
                      </Button>
                    </div>
                  )}

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600",
                      }}
                    >
                      피드백
                    </label>
                    <TextArea
                      value={editForm.feedback}
                      onChange={(e) =>
                        updateEditForm("feedback", e.target.value)
                      }
                      placeholder="이 운동에 대한 소감을 적어보세요..."
                    />
                  </div>

                  <ButtonGroup>
                    <Button
                      variant="outline"
                      onClick={() => setEditingDetailId(null)}
                    >
                      취소
                    </Button>
                    <Button onClick={handleSaveEdit} disabled={isLoading}>
                      {isLoading ? "저장 중..." : "저장"}
                    </Button>
                  </ButtonGroup>
                </EditForm>
              ) : (
                <>
                  <InfoGrid>
                    <InfoItem>
                      <label>운동 시간</label>
                      <span>{detail.duration}분</span>
                    </InfoItem>
                    <InfoItem>
                      <label>소모 칼로리</label>
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
                            {detail.avg_pace
                              ? secondsToPace(detail.avg_pace)
                              : "-"}
                          </span>
                        </InfoItem>
                      </>
                    )}
                  </InfoGrid>

                  {detail.workout_name === "fitness" &&
                    detail.fitnessDetails && (
                      <div style={{ marginTop: "16px" }}>
                        <h5
                          style={{
                            margin: "0 0 12px 0",
                            color: UI_CONSTANTS.COLORS.TEXT_PRIMARY,
                          }}
                        >
                          헬스 루틴 목록
                        </h5>
                        {detail.fitnessDetails.map((fitnessDetail, index) => (
                          <FitnessDetailContainer
                            key={fitnessDetail._id || index}
                          >
                            <FitnessDetailHeader>
                              <strong>루틴 {index + 1}</strong>
                              <Button
                                variant="danger"
                                size="small"
                                onClick={() =>
                                  setShowDeleteConfirm({
                                    type: "fitness",
                                    id:
                                      fitnessDetail._id ||
                                      `${detail._id}-${index}`,
                                  })
                                }
                              >
                                삭제
                              </Button>
                            </FitnessDetailHeader>
                            <FitnessDetailGrid>
                              <InfoItem>
                                <label>운동 부위</label>
                                <span>{fitnessDetail.body_part}</span>
                              </InfoItem>
                              <InfoItem>
                                <label>운동 종목</label>
                                <span>{fitnessDetail.fitness_type}</span>
                              </InfoItem>
                              <InfoItem>
                                <label>세트 수</label>
                                <span>{fitnessDetail.sets}</span>
                              </InfoItem>
                              <InfoItem>
                                <label>횟수</label>
                                <span>{fitnessDetail.reps}</span>
                              </InfoItem>
                              <InfoItem>
                                <label>무게</label>
                                <span>{fitnessDetail.weight}kg</span>
                              </InfoItem>
                            </FitnessDetailGrid>
                          </FitnessDetailContainer>
                        ))}
                      </div>
                    )}

                  {detail.feedback && (
                    <div style={{ marginTop: "16px" }}>
                      <InfoItem>
                        <label>피드백</label>
                        <span
                          style={{
                            display: "block",
                            marginTop: "4px",
                            lineHeight: "1.4",
                          }}
                        >
                          {detail.feedback}
                        </span>
                      </InfoItem>
                    </div>
                  )}
                </>
              )}
            </DetailSection>
          ))}

          {/* 새 운동 세부사항 추가 */}
          {isAddingNew && (
            <DetailSection>
              <DetailHeader>
                <h4 style={{ margin: 0 }}>새 운동 세부사항 추가</h4>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    variant={
                      editForm.workout_name === "running"
                        ? "primary"
                        : "outline"
                    }
                    size="small"
                    onClick={() => updateEditForm("workout_name", "running")}
                  >
                    러닝
                  </Button>
                  <Button
                    variant={
                      editForm.workout_name === "fitness"
                        ? "primary"
                        : "outline"
                    }
                    size="small"
                    onClick={() => updateEditForm("workout_name", "fitness")}
                  >
                    헬스
                  </Button>
                </div>
              </DetailHeader>

              <EditForm>
                <FormGrid>
                  <Input
                    label="운동 시간 (분)"
                    type="number"
                    value={editForm.duration.toString()}
                    onChange={(e) =>
                      updateEditForm("duration", Number(e.target.value))
                    }
                    min="0"
                  />
                  <Input
                    label="소모 칼로리"
                    type="number"
                    value={editForm.calories.toString()}
                    onChange={(e) =>
                      updateEditForm("calories", Number(e.target.value))
                    }
                    min="0"
                  />

                  {editForm.workout_name === "running" && (
                    <>
                      <Input
                        label="거리 (km)"
                        type="number"
                        value={editForm.distance.toString()}
                        onChange={(e) =>
                          updateEditForm("distance", Number(e.target.value))
                        }
                        min="0"
                        step="0.1"
                      />
                      <Input
                        label="평균 페이스 (분:초/km)"
                        type="text"
                        value={editForm.avg_pace}
                        onChange={(e) =>
                          updateEditForm("avg_pace", e.target.value)
                        }
                        placeholder="예: 5:30"
                      />
                    </>
                  )}
                </FormGrid>

                {editForm.workout_name === "fitness" && (
                  <div>
                    <h5 style={{ margin: "0 0 12px 0" }}>운동 루틴</h5>
                    {editForm.fitnessDetails.map((routine, index) => (
                      <div
                        key={index}
                        style={{
                          marginBottom: "12px",
                          padding: "12px",
                          backgroundColor: "white",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <strong>루틴 {index + 1}</strong>
                          {editForm.fitnessDetails.length > 1 && (
                            <Button
                              variant="danger"
                              size="small"
                              onClick={() => removeFitnessDetail(index)}
                            >
                              삭제
                            </Button>
                          )}
                        </div>
                        <FormGrid>
                          <Input
                            label="운동 부위"
                            type="text"
                            value={routine.body_part}
                            onChange={(e) =>
                              updateFitnessDetail(
                                index,
                                "body_part",
                                e.target.value
                              )
                            }
                            placeholder="예: 가슴, 등, 다리"
                          />
                          <Input
                            label="운동 종목"
                            type="text"
                            value={routine.fitness_type}
                            onChange={(e) =>
                              updateFitnessDetail(
                                index,
                                "fitness_type",
                                e.target.value
                              )
                            }
                            placeholder="예: 벤치프레스, 스쿼트"
                          />
                          <Input
                            label="세트 수"
                            type="number"
                            value={routine.sets.toString()}
                            onChange={(e) =>
                              updateFitnessDetail(
                                index,
                                "sets",
                                Number(e.target.value)
                              )
                            }
                            min="0"
                          />
                          <Input
                            label="횟수"
                            type="number"
                            value={routine.reps.toString()}
                            onChange={(e) =>
                              updateFitnessDetail(
                                index,
                                "reps",
                                Number(e.target.value)
                              )
                            }
                            min="0"
                          />
                          <Input
                            label="무게 (kg)"
                            type="number"
                            value={routine.weight.toString()}
                            onChange={(e) =>
                              updateFitnessDetail(
                                index,
                                "weight",
                                Number(e.target.value)
                              )
                            }
                            min="0"
                            step="0.1"
                          />
                        </FormGrid>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="small"
                      onClick={addFitnessDetail}
                    >
                      루틴 추가
                    </Button>
                  </div>
                )}

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                    }}
                  >
                    피드백
                  </label>
                  <TextArea
                    value={editForm.feedback}
                    onChange={(e) => updateEditForm("feedback", e.target.value)}
                    placeholder="추가 내용이 있나요?"
                  />
                </div>

                <ButtonGroup>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingNew(false)}
                  >
                    취소
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={isLoading}>
                    {isLoading ? "저장 중..." : "저장"}
                  </Button>
                </ButtonGroup>
              </EditForm>
            </DetailSection>
          )}

          <Button
            variant="outline"
            onClick={() => {
              console.log("새로 추가 모드 활성화");
              setIsAddingNew(true);
            }}
            disabled={isAddingNew || editingDetailId !== null}
          >
            새 운동 추가
          </Button>
        </div>

        {/* 전체 운동일지 삭제 */}
        <DeleteActions>
          <Button
            variant="danger"
            onClick={() =>
              setShowDeleteConfirm({ type: "workout", id: workout._id })
            }
            disabled={isLoading}
          >
            전체 운동일지 삭제
          </Button>
        </DeleteActions>

        {/* 삭제 확인 다이얼로그 */}
        {showDeleteConfirm && (
          <Modal
            isOpen={true}
            onClose={() => setShowDeleteConfirm(null)}
            title="삭제 확인"
          >
            <ConfirmDialog>
              <h4>정말 삭제하시겠습니까?</h4>
              <p>
                {showDeleteConfirm.type === "workout"
                  ? "전체 운동일지가 영구적으로 삭제됩니다."
                  : showDeleteConfirm.type === "fitness"
                  ? "선택한 헬스 루틴이 영구적으로 삭제됩니다."
                  : "선택한 운동 세부사항이 영구적으로 삭제됩니다."}
              </p>
              <ButtonGroup>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  취소
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  {isLoading ? "삭제 중..." : "삭제"}
                </Button>
              </ButtonGroup>
            </ConfirmDialog>
          </Modal>
        )}
      </ModalContent>
    </Modal>
  );
};

export default WorkoutDetailModal;

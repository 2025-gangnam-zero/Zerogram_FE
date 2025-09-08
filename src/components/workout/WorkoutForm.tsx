import React, { useState } from "react";
import styled from "styled-components";
import { UI_CONSTANTS } from "../../constants";
import Button from "../common/Button";
import Input from "../common/Input";
import { createWorkoutApi } from "../../api/workout";
import { WorkoutDetailType } from "../../types";

interface WorkoutFormProps {
  selectedDate: Date;
  onSuccess: () => void;
  onCancel: () => void;
}

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${UI_CONSTANTS.SPACING.LG};
`;

const WorkoutTypeSelector = styled.div`
  display: flex;
  gap: ${UI_CONSTANTS.SPACING.MD};
`;

const TypeButton = styled.button<{ $selected: boolean }>`
  padding: ${UI_CONSTANTS.SPACING.MD} ${UI_CONSTANTS.SPACING.LG};
  border: 2px solid ${UI_CONSTANTS.COLORS.PRIMARY};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  background-color: ${({ $selected }) =>
    $selected ? UI_CONSTANTS.COLORS.PRIMARY : "transparent"};
  color: ${({ $selected }) =>
    $selected ? "white" : UI_CONSTANTS.COLORS.PRIMARY};
  font-weight: 600;
  cursor: pointer;
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:hover {
    background-color: ${UI_CONSTANTS.COLORS.PRIMARY};
    color: white;
  }
`;

const ExerciseFormSection = styled.div`
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  padding: ${UI_CONSTANTS.SPACING.LG};
  margin-bottom: ${UI_CONSTANTS.SPACING.MD};
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${UI_CONSTANTS.SPACING.MD};
`;

const ExerciseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${UI_CONSTANTS.SPACING.MD};
  margin-bottom: ${UI_CONSTANTS.SPACING.MD};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${UI_CONSTANTS.SPACING.MD};
  justify-content: flex-end;
`;

const AddExerciseButton = styled(Button)`
  margin-top: ${UI_CONSTANTS.SPACING.MD};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  font-family: inherit;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${UI_CONSTANTS.COLORS.PRIMARY};
  }
`;

// 페이스를 초로 변환하는 함수 (5:30 -> 330초)
const paceToSeconds = (pace: string): number => {
  const parts = pace.split(":");
  if (parts.length !== 2) return 0;
  const minutes = parseInt(parts[0]) || 0;
  const seconds = parseInt(parts[1]) || 0;
  return minutes * 60 + seconds;
};

const WorkoutForm: React.FC<WorkoutFormProps> = ({
  selectedDate,
  onSuccess,
  onCancel,
}) => {
  const [workoutDetails, setWorkoutDetails] = useState<
    Omit<WorkoutDetailType, "_id" | "workoutId" | "createdAt" | "updatedAt">[]
  >([
    {
      workout_name: "running",
      duration: 0,
      calories: 0,
      feedback: "",
      distance: 0,
      avg_pace: 0,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addWorkoutDetail = () => {
    setWorkoutDetails([
      ...workoutDetails,
      {
        workout_name: "running",
        duration: 0,
        calories: 0,
        feedback: "",
      },
    ]);
  };

  const removeWorkoutDetail = (index: number) => {
    setWorkoutDetails(workoutDetails.filter((_, i) => i !== index));
  };

  const updateWorkoutDetail = (index: number, field: string, value: any) => {
    const updated = [...workoutDetails];
    updated[index] = { ...updated[index], [field]: value };
    setWorkoutDetails(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    const validDetails = workoutDetails.filter((detail) => {
      if (!detail.duration || !detail.calories) return false;

      if (detail.workout_name === "fitness") {
        return (
          detail.body_part &&
          detail.fitness_type &&
          detail.sets &&
          detail.reps &&
          detail.weight
        );
      } else if (detail.workout_name === "running") {
        return detail.distance && detail.avg_pace;
      }

      return true;
    });

    if (validDetails.length === 0) {
      alert("최소 하나의 운동을 완전히 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 페이스 문자열을 초로 변환
      const processedDetails = validDetails.map((detail) => ({
        ...detail,
        avg_pace:
          detail.avg_pace && typeof detail.avg_pace === "string"
            ? paceToSeconds(detail.avg_pace as string)
            : detail.avg_pace,
      }));

      await createWorkoutApi({ details: processedDetails });
      onSuccess();
    } catch (error) {
      console.error("운동일지 생성 실패:", error);
      alert("운동일지 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        <h3 style={{ margin: "0 0 16px 0" }}>운동 세부사항</h3>

        {workoutDetails.map((detail, index) => (
          <ExerciseFormSection key={index}>
            <ExerciseHeader>
              <h4 style={{ margin: 0 }}>운동 {index + 1}</h4>
              {workoutDetails.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  size="small"
                  onClick={() => removeWorkoutDetail(index)}
                >
                  삭제
                </Button>
              )}
            </ExerciseHeader>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                운동 종류
              </label>
              <WorkoutTypeSelector>
                <TypeButton
                  type="button"
                  $selected={detail.workout_name === "running"}
                  onClick={() =>
                    updateWorkoutDetail(index, "workout_name", "running")
                  }
                >
                  러닝
                </TypeButton>
                <TypeButton
                  type="button"
                  $selected={detail.workout_name === "fitness"}
                  onClick={() =>
                    updateWorkoutDetail(index, "workout_name", "fitness")
                  }
                >
                  헬스
                </TypeButton>
              </WorkoutTypeSelector>
            </div>

            <ExerciseGrid>
              <Input
                label="운동 시간 (분)"
                type="number"
                value={detail.duration.toString()}
                onChange={(e) =>
                  updateWorkoutDetail(index, "duration", Number(e.target.value))
                }
                min="0"
                required
              />
              <Input
                label="소모 칼로리"
                type="number"
                value={detail.calories.toString()}
                onChange={(e) =>
                  updateWorkoutDetail(index, "calories", Number(e.target.value))
                }
                min="0"
                required
              />
            </ExerciseGrid>

            {detail.workout_name === "running" && (
              <ExerciseGrid>
                <Input
                  label="거리 (km)"
                  type="number"
                  value={detail.distance?.toString() || ""}
                  onChange={(e) =>
                    updateWorkoutDetail(
                      index,
                      "distance",
                      Number(e.target.value)
                    )
                  }
                  min="0"
                  step="0.1"
                />
                <Input
                  label="평균 페이스 (분:초/km)"
                  type="text"
                  value={detail.avg_pace?.toString() || ""}
                  onChange={(e) =>
                    updateWorkoutDetail(index, "avg_pace", e.target.value)
                  }
                  placeholder="예: 5:30"
                />
              </ExerciseGrid>
            )}

            {detail.workout_name === "fitness" && (
              <>
                <ExerciseGrid>
                  <Input
                    label="운동 부위"
                    type="text"
                    value={detail.body_part || ""}
                    onChange={(e) =>
                      updateWorkoutDetail(index, "body_part", e.target.value)
                    }
                    placeholder="예: 가슴, 등, 다리"
                  />
                  <Input
                    label="운동 종목"
                    type="text"
                    value={detail.fitness_type || ""}
                    onChange={(e) =>
                      updateWorkoutDetail(index, "fitness_type", e.target.value)
                    }
                    placeholder="예: 벤치프레스, 스쿼트"
                  />
                </ExerciseGrid>
                <ExerciseGrid>
                  <Input
                    label="세트 수"
                    type="number"
                    value={detail.sets?.toString() || ""}
                    onChange={(e) =>
                      updateWorkoutDetail(index, "sets", Number(e.target.value))
                    }
                    min="0"
                  />
                  <Input
                    label="횟수"
                    type="number"
                    value={detail.reps?.toString() || ""}
                    onChange={(e) =>
                      updateWorkoutDetail(index, "reps", Number(e.target.value))
                    }
                    min="0"
                  />
                  <Input
                    label="무게 (kg)"
                    type="number"
                    value={detail.weight?.toString() || ""}
                    onChange={(e) =>
                      updateWorkoutDetail(
                        index,
                        "weight",
                        Number(e.target.value)
                      )
                    }
                    min="0"
                    step="0.1"
                  />
                </ExerciseGrid>
              </>
            )}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                운동 소감
              </label>
              <TextArea
                value={detail.feedback || ""}
                onChange={(e) =>
                  updateWorkoutDetail(index, "feedback", e.target.value)
                }
                placeholder="이 운동에 대한 소감을 적어보세요..."
                rows={3}
              />
            </div>
          </ExerciseFormSection>
        ))}

        <AddExerciseButton
          type="button"
          variant="outline"
          onClick={addWorkoutDetail}
        >
          운동 추가
        </AddExerciseButton>

        <ButtonGroup>
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};

export default WorkoutForm;

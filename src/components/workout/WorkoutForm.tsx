import React, { useState } from "react";
import styled from "styled-components";
import { UI_CONSTANTS } from "../../constants";
import Button from "../common/Button";
import Input from "../common/Input";
import { createWorkoutApi } from "../../api/workout";
import { WorkoutType, FitnessType, RunningType } from "../../types";

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

const FitnessFormSection = styled.div`
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  padding: ${UI_CONSTANTS.SPACING.LG};
  margin-bottom: ${UI_CONSTANTS.SPACING.MD};
`;

const FitnessHeader = styled.div`
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

const WorkoutForm: React.FC<WorkoutFormProps> = ({
  selectedDate,
  onSuccess,
  onCancel,
}) => {
  const [workoutType, setWorkoutType] = useState<WorkoutType | null>(null);
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [feedback, setFeedback] = useState("");

  // 러닝 데이터
  const [runningData, setRunningData] = useState<RunningType>({
    avg_pace: "",
    distance: "",
  });

  // 헬스 데이터 (사용자 직접 입력)
  const [fitnessData, setFitnessData] = useState<FitnessType[]>([
    {
      body_part: "",
      fitness_type: "",
      sets: 0,
      reps: 0,
      weight: 0,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addFitnessExercise = () => {
    setFitnessData([
      ...fitnessData,
      {
        body_part: "",
        fitness_type: "",
        sets: 0,
        reps: 0,
        weight: 0,
      },
    ]);
  };

  const removeFitnessExercise = (index: number) => {
    setFitnessData(fitnessData.filter((_, i) => i !== index));
  };

  const updateFitnessExercise = (
    index: number,
    field: keyof FitnessType,
    value: any
  ) => {
    const updated = [...fitnessData];
    updated[index] = { ...updated[index], [field]: value };
    setFitnessData(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workoutType || !duration || !calories) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const workoutData = {
        workout_name: workoutType,
        duration,
        calories,
        feedback,
        ...(workoutType === "running" && { running: runningData }),
        ...(workoutType === "fitness" && {
          fitness: fitnessData.filter((f) => f.body_part && f.fitness_type),
        }),
      };

      await createWorkoutApi(workoutData);
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
        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}
          >
            운동 종류
          </label>
          <WorkoutTypeSelector>
            <TypeButton
              type="button"
              $selected={workoutType === "running"}
              onClick={() => setWorkoutType("running")}
            >
              러닝
            </TypeButton>
            <TypeButton
              type="button"
              $selected={workoutType === "fitness"}
              onClick={() => setWorkoutType("fitness")}
            >
              헬스
            </TypeButton>
          </WorkoutTypeSelector>
        </div>

        <Input
          label="운동 시간 (분)"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="예: 30"
          required
        />

        <Input
          label="소모 칼로리"
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="예: 300"
          required
        />

        {workoutType === "running" && (
          <>
            <Input
              label="평균 페이스 (분:초/km)"
              type="text"
              value={runningData.avg_pace}
              onChange={(e) =>
                setRunningData({ ...runningData, avg_pace: e.target.value })
              }
              placeholder="예: 5:30"
            />
            <Input
              label="거리 (km)"
              type="text"
              value={runningData.distance}
              onChange={(e) =>
                setRunningData({ ...runningData, distance: e.target.value })
              }
              placeholder="예: 5.0"
            />
          </>
        )}

        {workoutType === "fitness" && (
          <div>
            <h3 style={{ margin: "0 0 16px 0" }}>운동 종목</h3>
            {fitnessData.map((exercise, index) => (
              <FitnessFormSection key={index}>
                <FitnessHeader>
                  <h4 style={{ margin: 0 }}>종목 {index + 1}</h4>
                  {fitnessData.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="small"
                      onClick={() => removeFitnessExercise(index)}
                    >
                      삭제
                    </Button>
                  )}
                </FitnessHeader>

                <Input
                  label="운동 부위"
                  type="text"
                  value={exercise.body_part}
                  onChange={(e) =>
                    updateFitnessExercise(index, "body_part", e.target.value)
                  }
                  placeholder="예: 가슴, 등, 다리, 어깨, 팔"
                />

                <Input
                  label="운동 종목"
                  type="text"
                  value={exercise.fitness_type}
                  onChange={(e) =>
                    updateFitnessExercise(index, "fitness_type", e.target.value)
                  }
                  placeholder="예: 벤치프레스, 스쿼트, 데드리프트"
                />

                <ExerciseGrid>
                  <Input
                    label="세트 수"
                    type="number"
                    value={exercise.sets.toString()}
                    onChange={(e) =>
                      updateFitnessExercise(
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
                    value={exercise.reps.toString()}
                    onChange={(e) =>
                      updateFitnessExercise(
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
                    value={exercise.weight.toString()}
                    onChange={(e) =>
                      updateFitnessExercise(
                        index,
                        "weight",
                        Number(e.target.value)
                      )
                    }
                    min="0"
                    step="0.1"
                  />
                </ExerciseGrid>
              </FitnessFormSection>
            ))}

            <AddExerciseButton
              type="button"
              variant="outline"
              onClick={addFitnessExercise}
            >
              종목 추가
            </AddExerciseButton>
          </div>
        )}

        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}
          >
            운동 소감
          </label>
          <TextArea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="오늘 운동에 대한 소감을 적어보세요..."
          />
        </div>

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

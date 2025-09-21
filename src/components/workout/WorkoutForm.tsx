import React, { useState } from "react";
import styled from "styled-components";
import { UI_CONSTANTS } from "../../constants";
import Button from "../common/Button";
import Input from "../common/Input";
import { createWorkoutApi } from "../../api/workout";
import {
  CreateWorkoutDetailRequest,
  CreateFitnessDetailRequest,
} from "../../types";

interface WorkoutFormProps {
  selectedDate: Date;
  onSuccess: () => void;
  onCancel: () => void;
}

// 루틴 인터페이스 (헬스용)
interface FitnessRoutine {
  body_part: string;
  fitness_type: string;
  sets: number;
  reps: number;
  weight: number;
}

// 운동 세션 인터페이스
interface WorkoutSession {
  id: string;
  workout_name: "running" | "fitness";
  duration: number;
  calories: number;
  feedback: string;

  // 러닝 데이터
  distance?: number;
  avg_pace?: string;

  // 헬스 루틴들
  routines?: FitnessRoutine[];
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

const SessionFormSection = styled.div`
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  padding: ${UI_CONSTANTS.SPACING.LG};
  margin-bottom: ${UI_CONSTANTS.SPACING.MD};
`;

const SessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${UI_CONSTANTS.SPACING.MD};
`;

const RoutineSection = styled.div`
  background-color: ${UI_CONSTANTS.COLORS.LIGHT};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
  padding: ${UI_CONSTANTS.SPACING.MD};
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
`;

const RoutineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
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

const AddButton = styled(Button)`
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
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([
    {
      id: Date.now().toString(),
      workout_name: "running",
      duration: 0,
      calories: 0,
      feedback: "",
      distance: 0,
      avg_pace: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // selectedDate가 변경될 때마다 폼 데이터 초기화
  React.useEffect(() => {
    setWorkoutSessions([
      {
        id: Date.now().toString(),
        workout_name: "running",
        duration: 0,
        calories: 0,
        feedback: "",
        distance: 0,
        avg_pace: "",
      },
    ]);
  }, [selectedDate]);

  // 새 운동 세션 추가
  const addWorkoutSession = () => {
    setWorkoutSessions([
      ...workoutSessions,
      {
        id: Date.now().toString(),
        workout_name: "running",
        duration: 0,
        calories: 0,
        feedback: "",
      },
    ]);
  };

  // 운동 세션 삭제
  const removeWorkoutSession = (sessionId: string) => {
    setWorkoutSessions(
      workoutSessions.filter((session) => session.id !== sessionId)
    );
  };

  // 운동 세션 업데이트
  const updateWorkoutSession = (
    sessionId: string,
    field: string,
    value: any
  ) => {
    setWorkoutSessions(
      workoutSessions.map((session) =>
        session.id === sessionId ? { ...session, [field]: value } : session
      )
    );
  };

  // 헬스 루틴 추가
  const addFitnessRoutine = (sessionId: string) => {
    setWorkoutSessions(
      workoutSessions.map((session) => {
        if (session.id === sessionId) {
          const newRoutine: FitnessRoutine = {
            body_part: "",
            fitness_type: "",
            sets: 0,
            reps: 0,
            weight: 0,
          };
          return {
            ...session,
            routines: [...(session.routines || []), newRoutine],
          };
        }
        return session;
      })
    );
  };

  // 헬스 루틴 삭제
  const removeFitnessRoutine = (sessionId: string, routineIndex: number) => {
    setWorkoutSessions(
      workoutSessions.map((session) => {
        if (session.id === sessionId && session.routines) {
          return {
            ...session,
            routines: session.routines.filter(
              (_, index) => index !== routineIndex
            ),
          };
        }
        return session;
      })
    );
  };

  // 헬스 루틴 업데이트
  const updateFitnessRoutine = (
    sessionId: string,
    routineIndex: number,
    field: keyof FitnessRoutine,
    value: any
  ) => {
    setWorkoutSessions(
      workoutSessions.map((session) => {
        if (session.id === sessionId && session.routines) {
          const updatedRoutines = [...session.routines];
          updatedRoutines[routineIndex] = {
            ...updatedRoutines[routineIndex],
            [field]: value,
          };
          return { ...session, routines: updatedRoutines };
        }
        return session;
      })
    );
  };

  // 운동 타입 변경 시 초기화
  const handleWorkoutTypeChange = (
    sessionId: string,
    type: "running" | "fitness"
  ) => {
    setWorkoutSessions(
      workoutSessions.map((session) => {
        if (session.id === sessionId) {
          if (type === "fitness") {
            return {
              ...session,
              workout_name: type,
              distance: undefined,
              avg_pace: undefined,
              routines: [
                {
                  body_part: "",
                  fitness_type: "",
                  sets: 0,
                  reps: 0,
                  weight: 0,
                },
              ],
            };
          } else {
            return {
              ...session,
              workout_name: type,
              distance: 0,
              avg_pace: "",
              routines: undefined,
            };
          }
        }
        return session;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사 및 데이터 변환
    const workoutDetails: CreateWorkoutDetailRequest[] = [];

    for (const session of workoutSessions) {
      if (!session.duration || !session.calories) {
        alert("운동 시간과 칼로리는 필수 입력사항입니다.");
        return;
      }

      if (session.workout_name === "running") {
        if (!session.distance || !session.avg_pace) {
          alert("러닝의 경우 거리와 평균 페이스를 입력해주세요.");
          return;
        }

        workoutDetails.push({
          workout_name: "running",
          duration: session.duration,
          calories: session.calories,
          feedback: session.feedback,
          distance: session.distance,
          avg_pace: paceToSeconds(session.avg_pace),
        });
      } else if (session.workout_name === "fitness") {
        if (!session.routines || session.routines.length === 0) {
          alert("헬스의 경우 최소 하나의 루틴을 입력해주세요.");
          return;
        }

        // 피트니스 루틴들을 fitnessDetails 배열로 변환
        const fitnessDetails: CreateFitnessDetailRequest[] = [];

        for (const routine of session.routines) {
          if (
            !routine.body_part ||
            !routine.fitness_type ||
            !routine.sets ||
            !routine.reps
          ) {
            alert("모든 루틴 정보를 완전히 입력해주세요.");
            return;
          }

          fitnessDetails.push({
            body_part: routine.body_part,
            fitness_type: routine.fitness_type,
            sets: routine.sets,
            reps: routine.reps,
            weight: routine.weight,
          });
        }

        workoutDetails.push({
          workout_name: "fitness",
          duration: session.duration,
          calories: session.calories,
          feedback: session.feedback,
          fitnessDetails: fitnessDetails,
        });
      }
    }

    if (workoutDetails.length === 0) {
      alert("최소 하나의 운동을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 선택된 날짜와 함께 API 호출
      await createWorkoutApi({ details: workoutDetails }, selectedDate);
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
        <h3 style={{ margin: "0 0 16px 0" }}>운동 세션</h3>

        {workoutSessions.map((session, sessionIndex) => (
          <SessionFormSection key={session.id}>
            <SessionHeader>
              <h4 style={{ margin: 0 }}>세션 {sessionIndex + 1}</h4>
              {workoutSessions.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  size="small"
                  onClick={() => removeWorkoutSession(session.id)}
                >
                  삭제
                </Button>
              )}
            </SessionHeader>

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
                  $selected={session.workout_name === "running"}
                  onClick={() => handleWorkoutTypeChange(session.id, "running")}
                >
                  러닝
                </TypeButton>
                <TypeButton
                  type="button"
                  $selected={session.workout_name === "fitness"}
                  onClick={() => handleWorkoutTypeChange(session.id, "fitness")}
                >
                  헬스
                </TypeButton>
              </WorkoutTypeSelector>
            </div>

            <ExerciseGrid>
              <Input
                label="운동 시간 (분)"
                type="number"
                value={session.duration.toString()}
                onChange={(e) =>
                  updateWorkoutSession(
                    session.id,
                    "duration",
                    Number(e.target.value)
                  )
                }
                min="0"
                required
              />
              <Input
                label="소모 칼로리"
                type="number"
                value={session.calories.toString()}
                onChange={(e) =>
                  updateWorkoutSession(
                    session.id,
                    "calories",
                    Number(e.target.value)
                  )
                }
                min="0"
                required
              />
            </ExerciseGrid>

            {session.workout_name === "running" && (
              <ExerciseGrid>
                <Input
                  label="거리 (km)"
                  type="number"
                  value={session.distance?.toString() || ""}
                  onChange={(e) =>
                    updateWorkoutSession(
                      session.id,
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
                  value={session.avg_pace || ""}
                  onChange={(e) =>
                    updateWorkoutSession(session.id, "avg_pace", e.target.value)
                  }
                  placeholder="예: 5:30"
                />
              </ExerciseGrid>
            )}

            {session.workout_name === "fitness" && (
              <div>
                <h5 style={{ margin: "16px 0 12px 0" }}>운동 루틴</h5>

                {session.routines?.map((routine, routineIndex) => (
                  <RoutineSection key={routineIndex}>
                    <RoutineHeader>
                      <strong>루틴 {routineIndex + 1}</strong>
                      {session.routines && session.routines.length > 1 && (
                        <Button
                          type="button"
                          variant="danger"
                          size="small"
                          onClick={() =>
                            removeFitnessRoutine(session.id, routineIndex)
                          }
                        >
                          삭제
                        </Button>
                      )}
                    </RoutineHeader>

                    <ExerciseGrid>
                      <Input
                        label="운동 부위"
                        type="text"
                        value={routine.body_part}
                        onChange={(e) =>
                          updateFitnessRoutine(
                            session.id,
                            routineIndex,
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
                          updateFitnessRoutine(
                            session.id,
                            routineIndex,
                            "fitness_type",
                            e.target.value
                          )
                        }
                        placeholder="예: 벤치프레스, 스쿼트"
                      />
                    </ExerciseGrid>
                    <ExerciseGrid>
                      <Input
                        label="세트 수"
                        type="number"
                        value={routine.sets.toString()}
                        onChange={(e) =>
                          updateFitnessRoutine(
                            session.id,
                            routineIndex,
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
                          updateFitnessRoutine(
                            session.id,
                            routineIndex,
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
                          updateFitnessRoutine(
                            session.id,
                            routineIndex,
                            "weight",
                            Number(e.target.value)
                          )
                        }
                        min="0"
                        step="0.1"
                      />
                    </ExerciseGrid>
                  </RoutineSection>
                ))}

                <AddButton
                  type="button"
                  variant="outline"
                  onClick={() => addFitnessRoutine(session.id)}
                >
                  루틴 추가
                </AddButton>
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
                value={session.feedback}
                onChange={(e) =>
                  updateWorkoutSession(session.id, "feedback", e.target.value)
                }
                placeholder="이 운동에 대한 소감을 적어보세요..."
                rows={3}
              />
            </div>
          </SessionFormSection>
        ))}

        <AddButton type="button" variant="outline" onClick={addWorkoutSession}>
          운동 세션 추가
        </AddButton>

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

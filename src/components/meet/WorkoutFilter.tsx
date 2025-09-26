import React from "react";
import styled from "styled-components";
import { Trophy, Dumbbell, Activity } from "lucide-react";
import { WorkoutType } from "../../types/workout";
import { UI_CONSTANTS } from "../../constants";

interface WorkoutFilterProps {
  selectedType: WorkoutType | "all";
  onTypeChange: (type: WorkoutType | "all") => void;
}

const FilterContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
  margin-bottom: 20px;
`;

const FilterTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin: 0 0 16px 0;
`;

const FilterOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FilterOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:hover {
    background-color: #f8f9fa;
  }
`;

const RadioInput = styled.input`
  margin: 0;
  accent-color: ${UI_CONSTANTS.COLORS.PRIMARY};
`;

const OptionLabel = styled.span`
  font-size: 0.9rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  font-weight: 500;
`;

const OptionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const WorkoutFilter: React.FC<WorkoutFilterProps> = ({
  selectedType,
  onTypeChange,
}) => {
  const workoutOptions = [
    { value: "all", label: "전체", icon: Trophy },
    { value: "fitness", label: "헬스", icon: Dumbbell },
    { value: "running", label: "러닝", icon: Activity },
  ] as const;

  return (
    <FilterContainer>
      <FilterTitle>운동 종류</FilterTitle>
      <FilterOptions>
        {workoutOptions.map((option) => (
          <FilterOption key={option.value}>
            <RadioInput
              type="radio"
              name="workoutType"
              value={option.value}
              checked={selectedType === option.value}
              onChange={() => onTypeChange(option.value as WorkoutType | "all")}
            />
            <OptionIcon>
              <option.icon size={18} />
            </OptionIcon>
            <OptionLabel>{option.label}</OptionLabel>
          </FilterOption>
        ))}
      </FilterOptions>
    </FilterContainer>
  );
};

export default WorkoutFilter;

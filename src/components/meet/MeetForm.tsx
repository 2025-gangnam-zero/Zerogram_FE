import React, { useState } from "react";
import styled from "styled-components";
import { WorkoutType } from "../../types/workout";
import { Location } from "../../types/meet";
import { UI_CONSTANTS } from "../../constants";
import Button from "../common/Button";
import Input from "../common/Input";

interface MeetFormProps {
  onSubmit: (data: MeetFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface MeetFormData {
  title: string;
  description: string;
  workout_type: WorkoutType;
  location: Location;
}

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 500px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
`;

const Required = styled.span`
  color: #e74c3c;
  margin-left: 4px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:focus {
    outline: none;
    border-color: ${UI_CONSTANTS.COLORS.PRIMARY};
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }

  &::placeholder {
    color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  }
`;

const SelectGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};

  &:focus {
    outline: none;
    border-color: ${UI_CONSTANTS.COLORS.PRIMARY};
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const Option = styled.option`
  padding: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const MeetForm: React.FC<MeetFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<MeetFormData>({
    title: "",
    description: "",
    workout_type: "fitness",
    location: "강남구",
  });

  const [errors, setErrors] = useState<Partial<MeetFormData>>({});

  const handleInputChange = (field: keyof MeetFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 에러가 있으면 제거
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<MeetFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "제목을 입력해주세요";
    } else if (formData.title.length < 2) {
      newErrors.title = "제목은 2글자 이상 입력해주세요";
    }

    if (!formData.description.trim()) {
      newErrors.description = "내용을 입력해주세요";
    } else if (formData.description.length < 10) {
      newErrors.description = "내용은 10글자 이상 입력해주세요";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>
            제목 <Required>*</Required>
          </Label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="모집글 제목을 입력해주세요"
            error={errors.title || ""}
          />
          {errors.title && (
            <span style={{ color: "#e74c3c", fontSize: "0.8rem" }}>
              {errors.title}
            </span>
          )}
        </FormGroup>

        <FormGroup>
          <Label>
            내용 <Required>*</Required>
          </Label>
          <TextArea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="모집 내용을 자세히 입력해주세요&#10;예: 운동 시간, 장소, 참여 조건 등"
          />
          {errors.description && (
            <span style={{ color: "#e74c3c", fontSize: "0.8rem" }}>
              {errors.description}
            </span>
          )}
        </FormGroup>

        <SelectGroup>
          <SelectContainer>
            <Label>
              운동 종류 <Required>*</Required>
            </Label>
            <Select
              value={formData.workout_type}
              onChange={(e) =>
                handleInputChange("workout_type", e.target.value as WorkoutType)
              }
            >
              <Option value="fitness">💪 헬스</Option>
              <Option value="running">🏃‍♀️ 러닝</Option>
            </Select>
          </SelectContainer>

          <SelectContainer>
            <Label>
              지역 <Required>*</Required>
            </Label>
            <Select
              value={formData.location}
              onChange={(e) =>
                handleInputChange("location", e.target.value as Location)
              }
            >
              <Option value="강남구">🏢 강남구</Option>
              <Option value="서초구">🌳 서초구</Option>
            </Select>
          </SelectContainer>
        </SelectGroup>

        <ButtonGroup>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "작성 중..." : "게시글 작성"}
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};

export default MeetForm;

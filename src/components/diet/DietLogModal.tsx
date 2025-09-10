import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { UI_CONSTANTS } from "../../constants";
import Button from "../common/Button";
import SearchableSelect, {
  type SelectedFood,
} from "../common/SearchableSelect";

interface DietLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.LG};
  max-width: 600px;
  width: 90%;
  max-height: 90%;
  overflow-y: auto;
  box-shadow: ${UI_CONSTANTS.SHADOWS.LG};
`;

const ModalHeader = styled.div`
  padding: ${UI_CONSTANTS.SPACING.LG};
  border-bottom: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  padding: 0;
  transition: color ${UI_CONSTANTS.TRANSITIONS.FAST};

  &:hover {
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  }
`;

const ModalContent = styled.div`
  padding: ${UI_CONSTANTS.SPACING.LG};
`;

const Section = styled.div`
  margin-bottom: ${UI_CONSTANTS.SPACING.XL};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${UI_CONSTANTS.SPACING.MD} 0;
  font-size: 18px;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
`;

const RadioGroup = styled.div`
  display: flex;
  gap: ${UI_CONSTANTS.SPACING.LG};
  align-items: center;
`;

const RadioLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${UI_CONSTANTS.SPACING.SM};
  cursor: pointer;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
`;

const FoodList = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${UI_CONSTANTS.SPACING.MD} 0 0 0;
  display: flex;
  flex-direction: column;
  gap: ${UI_CONSTANTS.SPACING.SM};
`;

const FoodListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${UI_CONSTANTS.SPACING.MD};
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  background: #fff;
`;

const FoodMeta = styled.span`
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-size: 14px;
`;

const Summary = styled.div`
  padding: ${UI_CONSTANTS.SPACING.MD};
  background: ${UI_CONSTANTS.COLORS.LIGHT};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
`;

const SelectedDateDisplay = styled.div`
  text-align: center;
  margin-bottom: ${UI_CONSTANTS.SPACING.LG};
  padding: ${UI_CONSTANTS.SPACING.MD};
  background-color: ${UI_CONSTANTS.COLORS.LIGHT};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};

  span {
    font-size: 18px;
    font-weight: 600;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${UI_CONSTANTS.SPACING.MD};
  justify-content: flex-end;
  margin-top: ${UI_CONSTANTS.SPACING.XL};
`;

const DietLogModal: React.FC<DietLogModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
}) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  // Form state
  type MealType = "아침" | "점심" | "저녁";
  const [mealType, setMealType] = useState<MealType>("아침");
  const [foods, setFoods] = useState<SelectedFood[]>([]);

  const totalCalories = useMemo(
    () => Math.round(foods.reduce((sum, f) => sum + (f.calories || 0), 0)),
    [foods]
  );

  const handleSelectFood = (food: SelectedFood) => {
    setFoods((prev) => [...prev, food]);
  };

  const handleRemoveFood = (index: number) => {
    setFoods((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const payload = {
      date: selectedDate,
      mealType,
      foods,
      totalCalories,
    };
    console.log("식단 저장:", payload);
    // TODO: API 연동 시 여기에서 저장 API 호출
    onClose();
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>식단일지 작성</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalContent>
          <SelectedDateDisplay>
            <span>{formatSelectedDate(selectedDate)}</span>
          </SelectedDateDisplay>

          <Section>
            <SectionTitle>식사 시간</SectionTitle>
            <RadioGroup>
              {(["아침", "점심", "저녁"] as const).map((label) => (
                <RadioLabel key={label}>
                  <input
                    type="radio"
                    name="mealType"
                    value={label}
                    checked={mealType === label}
                    onChange={() => setMealType(label)}
                  />
                  {label}
                </RadioLabel>
              ))}
            </RadioGroup>
          </Section>

          <Section>
            <SectionTitle>먹은 음식 추가</SectionTitle>
            <SearchableSelect
              onSelect={handleSelectFood}
              placeholder="음식명을 입력해 검색 후 선택하세요"
            />

            <FoodList>
              {foods.map((f, idx) => (
                <FoodListItem key={`${f.name}-${idx}`}>
                  <div>
                    <strong>{f.name}</strong>{" "}
                    <FoodMeta>{Math.round(f.calories)} kcal</FoodMeta>
                  </div>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => handleRemoveFood(idx)}
                  >
                    삭제
                  </Button>
                </FoodListItem>
              ))}
            </FoodList>
          </Section>

          <Section>
            <SectionTitle>총 칼로리</SectionTitle>
            <Summary>
              총합: <strong>{totalCalories}</strong> kcal
            </Summary>
          </Section>

          <Actions>
            <Button variant="secondary" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </Actions>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default DietLogModal;

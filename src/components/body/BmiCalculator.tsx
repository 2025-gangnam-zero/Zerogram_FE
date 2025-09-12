import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { UI_CONSTANTS } from "../../constants";
import Input from "../common/Input";
import Button from "../common/Button";

const CalculatorContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: ${UI_CONSTANTS.SPACING.LG};
  background: ${UI_CONSTANTS.COLORS.BACKGROUND};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  box-shadow: ${UI_CONSTANTS.SHADOWS.MD};
`;

const CalculatorTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: bold;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin-bottom: ${UI_CONSTANTS.SPACING.LG};
  text-align: center;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${UI_CONSTANTS.SPACING.MD};
  margin-bottom: ${UI_CONSTANTS.SPACING.LG};
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONSTANTS.SPACING.MD};
`;

const InputLabel = styled.label`
  font-size: 1rem;
  font-weight: 500;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  min-width: 60px;
`;

const StyledInput = styled(Input)`
  flex: 1;
`;

const UnitLabel = styled.span`
  font-size: 0.9rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  min-width: 30px;
`;

const ResultSection = styled.div`
  margin-top: ${UI_CONSTANTS.SPACING.LG};
  padding: ${UI_CONSTANTS.SPACING.LG};
  background: ${UI_CONSTANTS.COLORS.LIGHT};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  text-align: center;
`;

const BmiValue = styled.div<{ category: string }>`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${(props) => {
    switch (props.category) {
      case "저체중":
        return UI_CONSTANTS.COLORS.INFO;
      case "정상":
        return UI_CONSTANTS.COLORS.SUCCESS;
      case "과체중":
        return UI_CONSTANTS.COLORS.WARNING;
      case "비만":
        return UI_CONSTANTS.COLORS.DANGER;
      default:
        return UI_CONSTANTS.COLORS.TEXT_PRIMARY;
    }
  }};
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
`;

const BmiCategory = styled.div<{ category: string }>`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${(props) => {
    switch (props.category) {
      case "저체중":
        return UI_CONSTANTS.COLORS.INFO;
      case "정상":
        return UI_CONSTANTS.COLORS.SUCCESS;
      case "과체중":
        return UI_CONSTANTS.COLORS.WARNING;
      case "비만":
        return UI_CONSTANTS.COLORS.DANGER;
      default:
        return UI_CONSTANTS.COLORS.TEXT_PRIMARY;
    }
  }};
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
`;

const BmiDescription = styled.div`
  font-size: 0.9rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  line-height: 1.4;
`;

const BmiCalculator: React.FC = () => {
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");

  // BMI 계산 및 분류
  const bmiData = useMemo(() => {
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (!heightNum || !weightNum || heightNum <= 0 || weightNum <= 0) {
      return null;
    }

    // BMI 계산 (kg/m²)
    const bmi = weightNum / Math.pow(heightNum / 100, 2);

    // BMI 분류
    let category = "";
    let description = "";

    if (bmi < 18.5) {
      category = "저체중";
      description =
        "체중이 부족한 상태입니다. 균형 잡힌 식단과 적절한 운동을 통해 건강한 체중을 유지하세요.";
    } else if (bmi < 23) {
      category = "정상";
      description =
        "건강한 체중을 유지하고 있습니다. 현재의 생활습관을 유지하세요.";
    } else if (bmi < 25) {
      category = "과체중";
      description =
        "약간의 체중 관리가 필요합니다. 식단 조절과 규칙적인 운동을 권장합니다.";
    } else {
      category = "비만";
      description =
        "체중 관리가 필요합니다. 전문가와 상담하여 건강한 다이어트 계획을 세우세요.";
    }

    return {
      value: bmi,
      category,
      description,
    };
  }, [height, weight]);

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 숫자와 소수점만 허용
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setHeight(value);
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 숫자와 소수점만 허용
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setWeight(value);
    }
  };

  const handleReset = () => {
    setHeight("");
    setWeight("");
  };

  return (
    <CalculatorContainer>
      <CalculatorTitle>BMI 계산기</CalculatorTitle>

      <InputGroup>
        <InputRow>
          <InputLabel>키</InputLabel>
          <StyledInput
            type="text"
            value={height}
            onChange={handleHeightChange}
            placeholder="170"
          />
          <UnitLabel>cm</UnitLabel>
        </InputRow>

        <InputRow>
          <InputLabel>체중</InputLabel>
          <StyledInput
            type="text"
            value={weight}
            onChange={handleWeightChange}
            placeholder="70"
          />
          <UnitLabel>kg</UnitLabel>
        </InputRow>
      </InputGroup>

      {bmiData && (
        <ResultSection>
          <BmiValue category={bmiData.category}>
            {bmiData.value.toFixed(1)}
          </BmiValue>
          <BmiCategory category={bmiData.category}>
            {bmiData.category}
          </BmiCategory>
          <BmiDescription>{bmiData.description}</BmiDescription>
        </ResultSection>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: UI_CONSTANTS.SPACING.MD,
        }}
      >
        <Button variant="secondary" onClick={handleReset}>
          초기화
        </Button>
      </div>
    </CalculatorContainer>
  );
};

export default BmiCalculator;

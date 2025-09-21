import React, { useEffect } from "react";
import styled from "styled-components";
import Calendar from "react-calendar";
import type { Value } from "react-calendar/dist/shared/types.js";
import { useDietStore } from "../store";
import { UI_CONSTANTS, LAYOUT_CONSTANTS } from "../constants";
import Button from "../components/common/Button";
import DietLogModal from "../components/diet/DietLogModal";
import CalorieChart from "../components/diet/CalorieChart";
import BmiCalculator from "../components/body/BmiCalculator";
import "react-calendar/dist/Calendar.css";

const PageContainer = styled.div`
  max-width: ${LAYOUT_CONSTANTS.MAX_WIDTH};
  margin: 0 auto;
  padding: ${LAYOUT_CONSTANTS.CONTAINER_PADDING};
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  text-align: center;
  margin-bottom: ${UI_CONSTANTS.SPACING.XL};
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${UI_CONSTANTS.SPACING.XL};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CalendarSection = styled.div`
  background: white;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.LG};
  padding: ${UI_CONSTANTS.SPACING.LG};
  box-shadow: ${UI_CONSTANTS.SHADOWS.MD};
`;

const CalendarWrapper = styled.div`
  .react-calendar {
    width: 100%;
    border: none;
    font-family: inherit;
  }

  .react-calendar__tile {
    border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
    transition: all ${UI_CONSTANTS.TRANSITIONS.NORMAL};
    position: relative;

    &:hover {
      background-color: ${UI_CONSTANTS.COLORS.LIGHT};
    }
  }

  .react-calendar__tile--active {
    background-color: ${UI_CONSTANTS.COLORS.PRIMARY} !important;
    color: white;
  }
`;

const DietIndicator = styled.div<{ $hasDiet: boolean }>`
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ $hasDiet }) =>
    $hasDiet ? UI_CONSTANTS.COLORS.SUCCESS : "transparent"};
  transition: all ${UI_CONSTANTS.TRANSITIONS.FAST};
`;

const CalendarLegend = styled.div`
  display: flex;
  gap: ${UI_CONSTANTS.SPACING.LG};
  margin-top: ${UI_CONSTANTS.SPACING.MD};
  padding: ${UI_CONSTANTS.SPACING.MD};
  background-color: ${UI_CONSTANTS.COLORS.LIGHT};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  font-size: 14px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONSTANTS.SPACING.SM};
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
`;

const LegendDot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
`;

const DietSection = styled.div`
  background: white;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.LG};
  padding: ${UI_CONSTANTS.SPACING.LG};
  box-shadow: ${UI_CONSTANTS.SHADOWS.MD};
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin-bottom: ${UI_CONSTANTS.SPACING.LG};
`;

const CreateButton = styled(Button)`
  margin-bottom: ${UI_CONSTANTS.SPACING.LG};
`;

const SelectedDate = styled.div`
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

const AdditionalSection = styled.div`
  margin-top: ${UI_CONSTANTS.SPACING.XL};
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${UI_CONSTANTS.SPACING.XL};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.LG};
  padding: ${UI_CONSTANTS.SPACING.LG};
  box-shadow: ${UI_CONSTANTS.SHADOWS.MD};
`;

const BmiCard = styled.div`
  background: white;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.LG};
  padding: ${UI_CONSTANTS.SPACING.LG};
  box-shadow: ${UI_CONSTANTS.SHADOWS.MD};
`;

const MealSection = styled.div`
  margin-bottom: ${UI_CONSTANTS.SPACING.LG};
  background: ${UI_CONSTANTS.COLORS.LIGHT};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  padding: ${UI_CONSTANTS.SPACING.MD};
  border-left: 3px solid ${UI_CONSTANTS.COLORS.PRIMARY};
`;

const MealTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin-bottom: ${UI_CONSTANTS.SPACING.MD};
  padding-bottom: ${UI_CONSTANTS.SPACING.SM};
  border-bottom: 2px solid ${UI_CONSTANTS.COLORS.BORDER};
`;

const FoodList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${UI_CONSTANTS.SPACING.SM};
`;

const FoodItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${UI_CONSTANTS.SPACING.SM} ${UI_CONSTANTS.SPACING.MD};
  background: white;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
`;

const FoodName = styled.span`
  font-weight: 500;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
`;

const FoodAmount = styled.span`
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-size: 0.9rem;
`;

const TotalCalories = styled.div`
  text-align: center;
  padding: ${UI_CONSTANTS.SPACING.LG};
  background: linear-gradient(135deg, #667eea 0%, rgb(27, 219, 49) 100%);
  color: white;
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.LG};
  margin-top: ${UI_CONSTANTS.SPACING.LG};
  box-shadow: ${UI_CONSTANTS.SHADOWS.SM};
`;

const TotalCaloriesTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: ${UI_CONSTANTS.SPACING.SM};
`;

const TotalCaloriesValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: ${UI_CONSTANTS.SPACING.XL};
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-size: 1.1rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${UI_CONSTANTS.SPACING.XL};
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${UI_CONSTANTS.SPACING.XL};
  color: ${UI_CONSTANTS.COLORS.ERROR};
  font-size: 1.1rem;
  margin: ${UI_CONSTANTS.SPACING.XL} 0;
`;

const DietLogPage: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    openModal,
    setCurrentMonth,
    getDietLogByDate,
    setEditingDietLog,
    refreshDietLogs,
    isLoading,
    error,
  } = useDietStore();

  // selectedDateDietLog를 사용하므로 별도 상태 불필요

  // 초기 식단일지 로드 (WorkoutLogPage와 동일한 방식)
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    // 초기 로드
    setCurrentMonth(year, month);
  }, [setCurrentMonth]);

  // 선택된 날짜의 식단일지 필터링 (WorkoutLogPage와 동일한 방식)
  const selectedDateDietLog = getDietLogByDate(selectedDate);

  // 선택된 날짜의 식단일지 확인

  // 달력에서 월 변경 시 새로운 데이터 로드 (WorkoutLogPage와 동일한 방식)
  const handleActiveStartDateChange = ({
    activeStartDate,
  }: {
    activeStartDate: Date | null;
  }) => {
    if (activeStartDate) {
      const year = activeStartDate.getFullYear();
      const month = activeStartDate.getMonth() + 1;
      setCurrentMonth(year, month);
    }
  };

  // 날짜 선택 시 (WorkoutLogPage와 동일한 방식)
  const handleDateChange = (value: Value) => {
    let selectedDate: Date | null = null;

    if (value) {
      if (Array.isArray(value)) {
        selectedDate = value[0];
      } else {
        selectedDate = value;
      }
    }

    if (selectedDate) {
      setSelectedDate(selectedDate);

      // 선택된 날짜가 현재 로드된 월과 다르면 새로운 데이터 로드
      const selectedYear = selectedDate.getFullYear();
      const selectedMonth = selectedDate.getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      if (selectedYear !== currentYear || selectedMonth !== currentMonth) {
        setCurrentMonth(selectedYear, selectedMonth);
      }
    }
  };

  const handleOpenModal = () => {
    openModal();
  };

  const handleEditModal = () => {
    // 수정할 식단일지 설정 후 모달 열기
    if (selectedDateDietLog) {
      setEditingDietLog(selectedDateDietLog);
      openModal();
    }
  };

  const handleDietLogSuccess = () => {
    refreshDietLogs(); // 데이터 새로고침
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  // 특정 날짜에 식단일지가 있는지 확인하는 함수 (최적화된 버전)
  const hasDietOnDate = (date: Date): boolean => {
    const { monthlyLogs } = useDietStore.getState();

    // monthlyLogs가 없거나 비어있으면 false 반환
    if (!monthlyLogs || monthlyLogs.length === 0) {
      return false;
    }

    // 로컬 시간 기준으로 날짜 문자열 생성
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const targetDate = `${year}-${month}-${day}`;

    const hasDiet = monthlyLogs.some((log) => log && log.date === targetDate);

    return hasDiet;
  };

  // 달력 타일 내용을 렌더링하는 함수
  const renderTileContent = ({ date, view }: { date: Date; view: string }) => {
    // 월 보기에서만 표시
    if (view !== "month") return null;

    const hasDiet = hasDietOnDate(date);

    return <div>{hasDiet && <DietIndicator $hasDiet={hasDiet} />}</div>;
  };

  const formatMealType = (mealType: string) => {
    const mealTypes: { [key: string]: string } = {
      breakfast: "아침",
      lunch: "점심",
      dinner: "저녁",
      snack: "간식",
    };
    return mealTypes[mealType] || mealType;
  };

  const renderMealSection = (mealType: string, foods: any[]) => {
    if (!foods || foods.length === 0) return null;

    return (
      <MealSection key={mealType}>
        <MealTitle>{formatMealType(mealType)}</MealTitle>
        <FoodList>
          {foods.map((food, index) => (
            <FoodItem key={index}>
              <FoodName>{food.food_name}</FoodName>
              <FoodAmount>
                {food.food_amount ? `${food.food_amount}g` : "-"}
              </FoodAmount>
            </FoodItem>
          ))}
        </FoodList>
      </MealSection>
    );
  };

  return (
    <PageContainer>
      <PageTitle>식단 일지</PageTitle>

      <ContentWrapper>
        <CalendarSection>
          <SectionTitle>날짜 선택</SectionTitle>
          <CalendarWrapper>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              locale="ko-KR"
              onActiveStartDateChange={handleActiveStartDateChange}
              tileContent={renderTileContent}
            />
          </CalendarWrapper>

          <CalendarLegend>
            <LegendItem>
              <LegendDot $color={UI_CONSTANTS.COLORS.SUCCESS} />
              <span>식단일지 있음</span>
            </LegendItem>
          </CalendarLegend>
        </CalendarSection>

        <DietSection>
          <SectionTitle>식단 기록</SectionTitle>
          <SelectedDate>
            <span>{formatSelectedDate(selectedDate)}</span>
          </SelectedDate>

          {selectedDateDietLog ? (
            <CreateButton onClick={handleEditModal} fullWidth>
              수정
            </CreateButton>
          ) : (
            <CreateButton onClick={handleOpenModal} fullWidth>
              일지 작성
            </CreateButton>
          )}

          {isLoading && (
            <LoadingMessage>식단일지를 불러오는 중...</LoadingMessage>
          )}
          {error && <ErrorMessage>오류가 발생했습니다: {error}</ErrorMessage>}
          {!isLoading && !error && !selectedDateDietLog && (
            <NoDataMessage>
              선택한 날짜에 작성된 식단일지가 없습니다.
            </NoDataMessage>
          )}
          {!isLoading && !error && selectedDateDietLog && (
            <>
              {renderMealSection("breakfast", selectedDateDietLog.breakfast)}
              {renderMealSection("lunch", selectedDateDietLog.lunch)}
              {renderMealSection("dinner", selectedDateDietLog.dinner)}
              <TotalCalories>
                <TotalCaloriesTitle>총 칼로리</TotalCaloriesTitle>
                <TotalCaloriesValue>
                  {selectedDateDietLog.total_calories} kcal
                </TotalCaloriesValue>
              </TotalCalories>
            </>
          )}
        </DietSection>
      </ContentWrapper>

      {/* 추가 섹션 - 차트와 BMI 계산기 */}
      <AdditionalSection>
        <ChartCard>
          <SectionTitle>{`${selectedDate.getFullYear()}년 ${
            selectedDate.getMonth() + 1
          }월 일별 칼로리 섭취량`}</SectionTitle>
          <CalorieChart />
        </ChartCard>

        <BmiCard>
          <SectionTitle>BMI 계산기</SectionTitle>
          <BmiCalculator />
        </BmiCard>
      </AdditionalSection>

      <DietLogModal onSuccess={handleDietLogSuccess} />
    </PageContainer>
  );
};

export default DietLogPage;

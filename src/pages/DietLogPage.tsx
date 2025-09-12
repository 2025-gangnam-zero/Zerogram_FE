import React, { useEffect } from "react";
import styled from "styled-components";
import Calendar from "react-calendar";
import { useDietStore } from "../store";
import { UI_CONSTANTS, LAYOUT_CONSTANTS } from "../constants";
import Button from "../components/common/Button";
import DietLogModal from "../components/diet/DietLogModal";
import CalorieChart from "../components/diet/CalorieChart";
import BmiCalculator from "../components/body/BmiCalculator";
import { Value } from "react-calendar/dist/shared/types";

const PageContainer = styled.div`
  max-width: ${LAYOUT_CONSTANTS.MAX_WIDTH};
  margin: 0 auto;
  padding: ${LAYOUT_CONSTANTS.CONTAINER_PADDING};
  min-height: calc(
    100vh - ${LAYOUT_CONSTANTS.HEADER_HEIGHT} -
      ${LAYOUT_CONSTANTS.FOOTER_HEIGHT}
  );
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin-bottom: ${UI_CONSTANTS.SPACING.XL};
  text-align: center;
`;

const CalendarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${UI_CONSTANTS.SPACING.XL};
`;

const StyledCalendar = styled(Calendar)`
  width: 100%;
  max-width: 400px;
  border: 1px solid ${UI_CONSTANTS.COLORS.BORDER};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  box-shadow: ${UI_CONSTANTS.SHADOWS.MD};
  background: ${UI_CONSTANTS.COLORS.BACKGROUND};

  .react-calendar__tile {
    padding: 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: ${UI_CONSTANTS.TRANSITIONS.FAST};

    &:hover {
      background-color: ${UI_CONSTANTS.COLORS.LIGHT};
    }

    &.react-calendar__tile--active {
      background-color: ${UI_CONSTANTS.COLORS.PRIMARY};
      color: white;
    }

    &.react-calendar__tile--now {
      background-color: ${UI_CONSTANTS.COLORS.INFO};
      color: white;
    }
  }

  .react-calendar__navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background-color: ${UI_CONSTANTS.COLORS.LIGHT};
    border-bottom: 1px solid ${UI_CONSTANTS.COLORS.BORDER};

    button {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 8px;
      border-radius: ${UI_CONSTANTS.BORDER_RADIUS.SM};
      transition: ${UI_CONSTANTS.TRANSITIONS.FAST};

      &:hover {
        background-color: ${UI_CONSTANTS.COLORS.BORDER};
      }
    }
  }

  .react-calendar__month-view__weekdays {
    display: flex;
    justify-content: space-around;
    padding: 8px 0;
    background-color: ${UI_CONSTANTS.COLORS.LIGHT};
    border-bottom: 1px solid ${UI_CONSTANTS.COLORS.BORDER};

    .react-calendar__month-view__weekdays__weekday {
      font-weight: bold;
      color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
      text-align: center;
    }
  }
`;

const SelectedDateInfo = styled.div`
  margin-top: ${UI_CONSTANTS.SPACING.LG};
  padding: ${UI_CONSTANTS.SPACING.MD};
  background-color: ${UI_CONSTANTS.COLORS.LIGHT};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  text-align: center;
  font-size: 1.1rem;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
`;

const ActionSection = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${UI_CONSTANTS.SPACING.XL};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${UI_CONSTANTS.SPACING.XL};
  margin-top: ${UI_CONSTANTS.SPACING.XL};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${UI_CONSTANTS.SPACING.LG};
  }
`;

const ChartSection = styled.div`
  grid-column: 1 / -1;
  margin-bottom: ${UI_CONSTANTS.SPACING.LG};
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-style: italic;
  margin: ${UI_CONSTANTS.SPACING.XL} 0;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: ${UI_CONSTANTS.COLORS.DANGER};
  background: ${UI_CONSTANTS.COLORS.LIGHT};
  padding: ${UI_CONSTANTS.SPACING.MD};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  margin: ${UI_CONSTANTS.SPACING.XL} 0;
`;

const DietLogPage: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    openModal,
    getMonthlyLogs,
    currentYear,
    currentMonth,
    isLoading,
    error,
  } = useDietStore();

  // 컴포넌트 마운트 시 현재 월의 데이터 로드
  useEffect(() => {
    const today = new Date();
    getMonthlyLogs(today.getFullYear(), today.getMonth() + 1);
  }, [getMonthlyLogs]);

  // 선택된 날짜가 변경될 때 해당 월의 데이터 로드
  useEffect(() => {
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth() + 1;

    // 현재 로드된 월과 다르면 새로 로드
    if (selectedYear !== currentYear || selectedMonth !== currentMonth) {
      getMonthlyLogs(selectedYear, selectedMonth);
    }
  }, [selectedDate, currentYear, currentMonth, getMonthlyLogs]);

  const handleDateChange = (
    value: Value,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (value && typeof value === "object" && value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const handleOpenModal = () => {
    openModal();
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  return (
    <PageContainer>
      <PageTitle>식단 일지</PageTitle>

      <CalendarSection>
        <StyledCalendar
          value={selectedDate}
          onChange={handleDateChange}
          locale="ko-KR"
          showNeighboringMonth={false}
        />

        <SelectedDateInfo>
          선택한 날짜: {formatSelectedDate(selectedDate)}
        </SelectedDateInfo>
      </CalendarSection>

      <ActionSection>
        <Button onClick={handleOpenModal} variant="primary" size="large">
          선택한 날짜의 일지 작성
        </Button>
      </ActionSection>

      {/* 로딩 상태 */}
      {isLoading && <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>}

      {/* 에러 상태 */}
      {error && <ErrorMessage>오류가 발생했습니다: {error}</ErrorMessage>}

      {/* 차트 섹션 */}
      <ChartSection>
        <CalorieChart />
      </ChartSection>

      {/* BMI 계산기와 기타 도구들 */}
      <ContentGrid>
        <BmiCalculator />
        <div>{/* 향후 추가 도구들을 위한 공간 */}</div>
      </ContentGrid>

      <DietLogModal />
    </PageContainer>
  );
};

export default DietLogPage;

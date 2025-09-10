import React, { useState } from "react";
import styled from "styled-components";
import Calendar from "react-calendar";
import type { Value } from "react-calendar/dist/shared/types.js";
import { UI_CONSTANTS, LAYOUT_CONSTANTS } from "../constants";
import Button from "../components/common/Button";
import DietLogModal from "../components/diet/DietLogModal";
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
  display: flex;
  flex-direction: column;
  gap: ${UI_CONSTANTS.SPACING.XL};
  max-width: 600px;
  margin: 0 auto;
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

    &:hover {
      background-color: ${UI_CONSTANTS.COLORS.LIGHT};
    }
  }

  .react-calendar__tile--active {
    background-color: ${UI_CONSTANTS.COLORS.PRIMARY} !important;
    color: white;
  }
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

const DiaryButton = styled(Button)`
  margin-top: ${UI_CONSTANTS.SPACING.LG};
  width: 100%;
`;

const DietLogPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 날짜 선택 핸들러
  const handleDateChange = (value: Value) => {
    // Value는 Date | null | [Date | null, Date | null] 타입
    let selectedDate: Date | null = null;

    if (value) {
      if (Array.isArray(value)) {
        // Range 선택의 경우 첫 번째 날짜 사용
        selectedDate = value[0];
      } else {
        // 단일 날짜 선택
        selectedDate = value;
      }
    }

    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  // 선택된 날짜를 한국어 형식으로 포맷
  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  // 일지 작성 버튼 클릭 핸들러
  const handleDiaryWrite = () => {
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <PageContainer>
      <PageTitle>식단일지</PageTitle>

      <ContentWrapper>
        <CalendarSection>
          <CalendarWrapper>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              locale="ko-KR"
            />
          </CalendarWrapper>

          <SelectedDate>
            <span>{formatSelectedDate(selectedDate)}</span>
          </SelectedDate>

          <DiaryButton onClick={handleDiaryWrite} fullWidth>
            선택한 날짜의 일지 작성
          </DiaryButton>
        </CalendarSection>
      </ContentWrapper>

      <DietLogModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        selectedDate={selectedDate}
      />
    </PageContainer>
  );
};

export default DietLogPage;

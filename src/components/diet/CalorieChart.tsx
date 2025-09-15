import React, { useRef, useMemo } from "react";
import styled from "styled-components";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler, // Filler 플러그인 추가
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useDietStore } from "../../store";
import { UI_CONSTANTS } from "../../constants";

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler // Filler 플러그인 등록
);

const ChartContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: ${UI_CONSTANTS.SPACING.LG};
  background: ${UI_CONSTANTS.COLORS.BACKGROUND};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  box-shadow: ${UI_CONSTANTS.SHADOWS.MD};
`;

const ChartTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: bold;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin-bottom: ${UI_CONSTANTS.SPACING.LG};
  text-align: center;
`;

const ChartWrapper = styled.div`
  position: relative;
  height: 400px;
  width: 100%;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-size: 1.1rem;
  font-style: italic;
`;

const CalorieChart: React.FC = () => {
  const { monthlyLogs, currentYear, currentMonth } = useDietStore();
  const chartRef = useRef<ChartJS<"line">>(null);

  // 월별 데이터를 일별 칼로리로 변환
  const chartData = useMemo(() => {
    if (!monthlyLogs || monthlyLogs.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // 해당 월의 모든 날짜 생성
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}일`);

    // 일별 칼로리 데이터 생성
    const dailyCalories = Array.from({ length: daysInMonth }, () => 0);

    monthlyLogs.forEach((log) => {
      const logDate = new Date(log.date);
      const day = logDate.getDate();

      if (day >= 1 && day <= daysInMonth) {
        // 같은 날짜의 칼로리를 누적 합산
        //const beforeCalories = dailyCalories[day - 1];
        dailyCalories[day - 1] += log.total_calories;
      }
    });

    return {
      labels,
      datasets: [
        {
          label: "일별 총 칼로리",
          data: dailyCalories,
          borderColor: UI_CONSTANTS.COLORS.PRIMARY,
          backgroundColor: `${UI_CONSTANTS.COLORS.PRIMARY}20`,
          borderWidth: 3,
          pointBackgroundColor: UI_CONSTANTS.COLORS.PRIMARY,
          pointBorderColor: UI_CONSTANTS.COLORS.PRIMARY,
          pointRadius: 5,
          pointHoverRadius: 8,
          tension: 0.4,
        },
      ],
    };
  }, [monthlyLogs, currentYear, currentMonth]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 14,
            weight: "bold" as const,
          },
          color: UI_CONSTANTS.COLORS.TEXT_PRIMARY,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: UI_CONSTANTS.COLORS.DARK,
        titleColor: UI_CONSTANTS.COLORS.BACKGROUND,
        bodyColor: UI_CONSTANTS.COLORS.BACKGROUND,
        borderColor: UI_CONSTANTS.COLORS.PRIMARY,
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            return `칼로리: ${context.parsed.y} kcal`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: UI_CONSTANTS.COLORS.BORDER,
        },
        ticks: {
          color: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: UI_CONSTANTS.COLORS.BORDER,
        },
        ticks: {
          color: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
          font: {
            size: 12,
          },
          callback: function (value: any) {
            return `${value} kcal`;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  const hasData = monthlyLogs && monthlyLogs.length > 0;

  return (
    <ChartContainer>
      <ChartTitle>
        {currentYear}년 {currentMonth}월 일별 칼로리 섭취량
      </ChartTitle>
      <ChartWrapper>
        {hasData ? (
          <Line ref={chartRef} data={chartData} options={options} />
        ) : (
          <NoDataMessage>
            이번 달에는 기록된 식단 일지가 없습니다.
          </NoDataMessage>
        )}
      </ChartWrapper>
    </ChartContainer>
  );
};

export default CalorieChart;

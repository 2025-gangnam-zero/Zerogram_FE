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
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useDietStore } from "../../store/dietStore";
import { useWorkoutStore } from "../../store/workoutStore";
import { UI_CONSTANTS } from "../../constants";

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartContainer = styled.div`
  width: 100%;
  background: ${UI_CONSTANTS.COLORS.BACKGROUND};
  border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
  box-shadow: ${UI_CONSTANTS.SHADOWS.SM};
  padding: ${UI_CONSTANTS.SPACING.MD};
`;

const ChartTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
  margin: 0 0 ${UI_CONSTANTS.SPACING.MD} 0;
  text-align: center;
`;

const ChartWrapper = styled.div`
  position: relative;
  height: 200px;
  width: 100%;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
  font-size: 0.9rem;
  font-style: italic;
`;

const CombinedCalorieChart: React.FC = () => {
  const {
    monthlyLogs: dietLogs,
    currentYear: dietYear,
    currentMonth: dietMonth,
  } = useDietStore();
  const {
    workouts,
    currentYear: workoutYear,
    currentMonth: workoutMonth,
  } = useWorkoutStore();
  const chartRef = useRef<ChartJS<"line">>(null);

  // 현재 월의 데이터를 사용 (diet와 workout 중 하나라도 있으면)
  const currentYear = dietYear || workoutYear;
  const currentMonth = dietMonth || workoutMonth;

  // 월별 데이터를 일별 칼로리로 변환
  const chartData = useMemo(() => {
    // 해당 월의 모든 날짜 생성
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}일`);

    // 일별 칼로리 데이터 생성
    const dailyIntakeCalories = Array.from({ length: daysInMonth }, () => 0);
    const dailyBurnCalories = Array.from({ length: daysInMonth }, () => 0);

    // 식단일지 데이터 처리
    if (dietLogs && dietLogs.length > 0) {
      dietLogs.forEach((log) => {
        if (!log || !log.date) return;

        const logDate = new Date(log.date);
        const day = logDate.getDate();

        if (day >= 1 && day <= daysInMonth) {
          dailyIntakeCalories[day - 1] += log.total_calories || 0;
        }
      });
    }

    // 운동일지 데이터 처리
    if (workouts && workouts.length > 0) {
      workouts.forEach((workout) => {
        if (!workout || !workout.details) return;

        // workout.date가 있으면 사용, 없으면 createdAt 사용
        let workoutDate: Date;
        if (workout.date) {
          workoutDate = new Date(workout.date);
        } else {
          workoutDate = new Date(workout.createdAt);
        }

        const day = workoutDate.getDate();

        if (day >= 1 && day <= daysInMonth) {
          // 해당 운동일지의 모든 세부사항의 칼로리를 합산
          const totalCalories = workout.details.reduce((sum, detail) => {
            return sum + (detail.calories || 0);
          }, 0);

          dailyBurnCalories[day - 1] += totalCalories;
        }
      });
    }

    return {
      labels,
      datasets: [
        {
          label: "섭취 칼로리",
          data: dailyIntakeCalories,
          borderColor: UI_CONSTANTS.COLORS.PRIMARY,
          backgroundColor: `${UI_CONSTANTS.COLORS.PRIMARY}20`,
          borderWidth: 2,
          pointBackgroundColor: UI_CONSTANTS.COLORS.PRIMARY,
          pointBorderColor: UI_CONSTANTS.COLORS.PRIMARY,
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.4,
          fill: false,
        },
        {
          label: "소모 칼로리",
          data: dailyBurnCalories,
          borderColor: "#e74c3c",
          backgroundColor: "#e74c3c20",
          borderWidth: 2,
          pointBackgroundColor: "#e74c3c",
          pointBorderColor: "#e74c3c",
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.4,
          fill: false,
        },
      ],
    };
  }, [dietLogs, workouts, currentYear, currentMonth]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 12,
            weight: "normal" as const,
          },
          color: UI_CONSTANTS.COLORS.TEXT_PRIMARY,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: UI_CONSTANTS.COLORS.DARK,
        titleColor: UI_CONSTANTS.COLORS.BACKGROUND,
        bodyColor: UI_CONSTANTS.COLORS.BACKGROUND,
        borderColor: UI_CONSTANTS.COLORS.PRIMARY,
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y} kcal`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: UI_CONSTANTS.COLORS.BORDER,
          display: false,
        },
        ticks: {
          color: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
          font: {
            size: 10,
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
            size: 10,
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

  const hasData =
    (dietLogs && dietLogs.length > 0) || (workouts && workouts.length > 0);

  return (
    <ChartContainer>
      <ChartTitle>
        {currentYear}년 {currentMonth}월 칼로리 현황
      </ChartTitle>
      <ChartWrapper>
        {hasData ? (
          <Line ref={chartRef} data={chartData} options={options} />
        ) : (
          <NoDataMessage>이번 달에는 기록된 데이터가 없습니다.</NoDataMessage>
        )}
      </ChartWrapper>
    </ChartContainer>
  );
};

export default CombinedCalorieChart;

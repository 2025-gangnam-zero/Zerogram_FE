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
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
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
  Filler
);

const ChartContainer = styled.div`
  width: 100%;
  max-width: 100%;
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

const WorkoutCalorieChart: React.FC = () => {
  const { workouts, currentYear, currentMonth } = useWorkoutStore();
  const chartRef = useRef<ChartJS<"line">>(null);

  // 월별 데이터를 일별 소모 칼로리로 변환
  const chartData = useMemo(() => {
    if (!workouts || workouts.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // 해당 월의 모든 날짜 생성
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}일`);

    // 일별 소모 칼로리 데이터 생성
    const dailyCalories = Array.from({ length: daysInMonth }, () => 0);

    workouts.forEach((workout) => {
      // null 체크 추가
      if (!workout || !workout.details) {
        return;
      }

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

        // 같은 날짜의 칼로리를 누적 합산
        dailyCalories[day - 1] += totalCalories;
      }
    });

    return {
      labels,
      datasets: [
        {
          label: "일별 총 소모 칼로리",
          data: dailyCalories,
          borderColor: "#e74c3c", // 운동 테마에 맞는 빨간색
          backgroundColor: "#e74c3c20",
          borderWidth: 3,
          pointBackgroundColor: "#e74c3c",
          pointBorderColor: "#e74c3c",
          pointRadius: 5,
          pointHoverRadius: 8,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [workouts, currentYear, currentMonth]);

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
        borderColor: "#e74c3c",
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            return `소모 칼로리: ${context.parsed.y} kcal`;
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

  const hasData = workouts && workouts.length > 0;

  return (
    <ChartContainer>
      <ChartTitle>
        {currentYear}년 {currentMonth}월 일별 소모 칼로리
      </ChartTitle>
      <ChartWrapper>
        {hasData ? (
          <Line ref={chartRef} data={chartData} options={options} />
        ) : (
          <NoDataMessage>이번 달에는 기록된 운동일지가 없습니다.</NoDataMessage>
        )}
      </ChartWrapper>
    </ChartContainer>
  );
};

export default WorkoutCalorieChart;

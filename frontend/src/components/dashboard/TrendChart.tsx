import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export type ChartPeriod = "day" | "week" | "month" | "year";

interface TrendChartProps {
  period: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
  incomeData: Array<{ date: string; amount: number }>;
  expenseData: Array<{ date: string; amount: number }>;
  loading?: boolean;
}

const PERIOD_LABELS: Record<ChartPeriod, string> = {
  day: "День",
  week: "Неделя",
  month: "Месяц",
  year: "Год",
};

export function TrendChart({
  period,
  onPeriodChange,
  incomeData,
  expenseData,
  loading,
}: TrendChartProps) {
  const chartData = useMemo(() => {
    if (
      (!incomeData || incomeData.length === 0) &&
      (!expenseData || expenseData.length === 0)
    ) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const labels = incomeData?.map((item) => item.date) || [];

    return {
      labels,
      datasets: [
        {
          label: "Доходы",
          data: incomeData?.map((item) => item.amount) || [],
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.4,
        },
        {
          label: "Расходы",
          data: expenseData?.map((item) => item.amount) || [],
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
        },
      ],
    };
  }, [incomeData, expenseData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("ru-RU", {
                style: "currency",
                currency: "USD",
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return new Intl.NumberFormat("ru-RU", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
            }).format(value);
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (
    (!incomeData || incomeData.length === 0) &&
    (!expenseData || expenseData.length === 0)
  ) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Доходы vs Расходы</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Нет данных для отображения
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Доходы vs Расходы</h2>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(PERIOD_LABELS) as ChartPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1 rounded text-sm ${
                period === p
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64 sm:h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

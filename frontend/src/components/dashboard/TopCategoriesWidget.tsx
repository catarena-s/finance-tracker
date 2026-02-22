import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TopCategory {
  categoryName: string;
  totalAmount: number;
  percentage: number;
}

interface TopCategoriesWidgetProps {
  categories: TopCategory[];
  loading?: boolean;
  limit?: number;
}

export function TopCategoriesWidget({
  categories,
  loading,
  limit = 5,
}: TopCategoriesWidgetProps) {
  const chartData = useMemo(() => {
    if (!categories || categories.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const limitedCategories = categories.slice(0, limit);

    return {
      labels: limitedCategories.map((cat) => cat.categoryName),
      datasets: [
        {
          label: "Сумма",
          data: limitedCategories.map((cat) => cat.totalAmount),
          backgroundColor: [
            "rgba(239, 68, 68, 0.8)",
            "rgba(249, 115, 22, 0.8)",
            "rgba(234, 179, 8, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(59, 130, 246, 0.8)",
          ],
          borderColor: [
            "rgb(239, 68, 68)",
            "rgb(249, 115, 22)",
            "rgb(234, 179, 8)",
            "rgb(34, 197, 94)",
            "rgb(59, 130, 246)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [categories, limit]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const category = categories[context.dataIndex];
            const amount = new Intl.NumberFormat("ru-RU", {
              style: "currency",
              currency: "USD",
            }).format(context.parsed.x);
            const percentage = category?.percentage?.toFixed(1) || "0";
            return `${amount} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
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
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Топ категории</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Нет данных для отображения
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Топ {limit} категорий</h2>
      <div className="h-64 sm:h-80">
        <Bar data={chartData} options={options} />
      </div>
      <div className="mt-4 space-y-2">
        {categories.slice(0, limit).map((cat) => (
          <div key={`${cat.categoryName}-${cat.totalAmount}`} className="flex justify-between items-center text-sm">
            <span className="text-gray-700">{cat.categoryName}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {new Intl.NumberFormat("ru-RU", {
                  style: "currency",
                  currency: "USD",
                }).format(cat.totalAmount)}
              </span>
              <span className="text-gray-500">({cat.percentage.toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

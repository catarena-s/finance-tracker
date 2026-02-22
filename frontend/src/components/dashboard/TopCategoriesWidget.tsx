import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  type ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { CHART_COLORS, chartGrid, chartAnimation, tooltipDefaults, formatCurrencyTooltip } from "@/lib/chartConfig";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const SOFT_BAR_COLORS = [
  "rgba(99, 102, 241, 0.75)",
  "rgba(16, 185, 129, 0.75)",
  "rgba(99, 102, 241, 0.55)",
  "rgba(16, 185, 129, 0.55)",
  "rgba(99, 102, 241, 0.4)",
];

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
  const chartData = useMemo((): ChartData<"bar", number[], string> => {
    if (!categories || categories.length === 0) {
      return { labels: [], datasets: [] };
    }
    const limitedCategories = categories.slice(0, limit);
    return {
      labels: limitedCategories.map((cat) => cat.categoryName),
      datasets: [
        {
          label: "Сумма",
          data: limitedCategories.map((cat) => cat.totalAmount),
          backgroundColor: SOFT_BAR_COLORS.slice(0, limitedCategories.length),
          borderColor: CHART_COLORS.primary,
          borderWidth: 0,
          borderRadius: 6,
        },
      ],
    };
  }, [categories, limit]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y" as const,
      animation: chartAnimation,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: tooltipDefaults.backgroundColor,
          titleColor: tooltipDefaults.titleColor,
          bodyColor: tooltipDefaults.bodyColor,
          borderColor: tooltipDefaults.borderColor,
          borderWidth: tooltipDefaults.borderWidth,
          padding: tooltipDefaults.padding,
          cornerRadius: tooltipDefaults.cornerRadius,
          callbacks: {
            label: (context: { dataIndex: number; parsed: { x: number | null } }) => {
              const category = categories[context.dataIndex];
              const x = context.parsed.x;
              const amount = x != null ? formatCurrencyTooltip(x) : "—";
              const percentage = category?.percentage?.toFixed(1) || "0";
              return `${amount} (${percentage}%)`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: chartGrid,
          ticks: {
            color: CHART_COLORS.text,
            callback: (value: unknown): string =>
              typeof value === "number" ? formatCurrencyTooltip(value) : String(value ?? ""),
          },
        },
        y: {
          grid: { display: false },
          ticks: { color: CHART_COLORS.text },
        },
      },
    }),
    [categories]
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-1/2 mb-4" />
            <div className="h-64 bg-muted rounded-2xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Топ категорий расходов</h2>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Нет данных для отображения
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Топ {limit} категорий расходов</h2>
        <div className="h-64 sm:h-80">
          <Bar data={chartData} options={options} />
        </div>
        <div className="mt-4 space-y-2">
          {categories.slice(0, limit).map((cat) => (
            <div
              key={`${cat.categoryName}-${cat.totalAmount}`}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-foreground">{cat.categoryName}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {formatCurrencyTooltip(cat.totalAmount)}
                </span>
                <span className="text-muted-foreground">({cat.percentage.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

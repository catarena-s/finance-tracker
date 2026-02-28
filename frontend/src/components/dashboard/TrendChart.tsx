import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import {
  CHART_COLORS,
  chartGrid,
  chartAnimation,
  tooltipDefaults,
  formatCurrencyTooltip,
} from "@/lib/chartConfig";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { getChartConfig, getChartHeightClasses } from "@/lib/responsiveConfig";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface TrendChartProps {
  incomeData: Array<{ date: string; amount: number }>;
  expenseData: Array<{ date: string; amount: number }>;
  loading?: boolean;
}

export function TrendChart({ incomeData, expenseData, loading }: TrendChartProps) {
  const { isMobile, isTablet } = useBreakpoint();
  const chartConfig = useMemo(() => getChartConfig(isMobile, isTablet), [isMobile, isTablet]);

  const chartData = useMemo((): ChartData<"line", number[], string> => {
    if (
      (!incomeData || incomeData.length === 0) &&
      (!expenseData || expenseData.length === 0)
    ) {
      return { labels: [], datasets: [] };
    }
    const labels = incomeData?.map((item) => item.date) || [];
    return {
      labels,
      datasets: [
        {
          label: "Доходы",
          data: incomeData?.map((item) => item.amount) || [],
          borderColor: CHART_COLORS.secondary,
          backgroundColor: CHART_COLORS.secondaryLight,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: chartConfig.pointRadius,
          pointHoverRadius: chartConfig.pointRadius + 2,
        },
        {
          label: "Расходы",
          data: expenseData?.map((item) => item.amount) || [],
          borderColor: CHART_COLORS.destructive,
          backgroundColor: CHART_COLORS.destructiveLight,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: chartConfig.pointRadius,
          pointHoverRadius: chartConfig.pointRadius + 2,
        },
      ],
    };
  }, [incomeData, expenseData, chartConfig.pointRadius]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: chartAnimation,
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
          labels: { 
            color: CHART_COLORS.text, 
            usePointStyle: true,
            font: {
              size: chartConfig.fontSize,
            },
          },
        },
        tooltip: {
          mode: "index" as const,
          intersect: false,
          backgroundColor: tooltipDefaults.backgroundColor,
          titleColor: tooltipDefaults.titleColor,
          bodyColor: tooltipDefaults.bodyColor,
          borderColor: tooltipDefaults.borderColor,
          borderWidth: tooltipDefaults.borderWidth,
          padding: tooltipDefaults.padding,
          cornerRadius: tooltipDefaults.cornerRadius,
          callbacks: {
            label: (context: {
              dataset: { label?: string };
              parsed: { y: number | null };
            }) => {
              const label = context.dataset.label || "";
              const value = context.parsed.y;
              return label && value != null
                ? `${label}: ${formatCurrencyTooltip(value)}`
                : label || "";
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { 
            color: CHART_COLORS.text, 
            maxTicksLimit: chartConfig.maxTicksLimit,
            font: {
              size: chartConfig.fontSize,
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: chartGrid,
          ticks: {
            color: CHART_COLORS.text,
            font: {
              size: chartConfig.fontSize,
            },
            callback: (value: unknown): string =>
              typeof value === "number"
                ? formatCurrencyTooltip(value)
                : String(value ?? ""),
          },
        },
      },
    }),
    [chartConfig]
  );

  if (loading) {
    return (
      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="animate-pulse">
            <div className="mb-4 h-6 w-1/3 rounded bg-muted" />
            <div className="h-64 rounded-2xl bg-muted/50" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (
    (!incomeData || incomeData.length === 0) &&
    (!expenseData || expenseData.length === 0)
  ) {
    return (
      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardContent className="p-6 md:p-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Доходы и расходы
          </h2>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Нет данных для отображения
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-6 md:p-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Доходы и расходы</h2>
        <div className={getChartHeightClasses()}>
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

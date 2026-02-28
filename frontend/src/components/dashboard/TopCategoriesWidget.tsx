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
import { CategoryIcon } from "@/utils/categoryIcons";
import {
  CHART_COLORS,
  chartGrid,
  chartAnimation,
  tooltipDefaults,
  formatCurrencyTooltip,
} from "@/lib/chartConfig";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { getChartConfig } from "@/lib/responsiveConfig";
import { optimizeGenericData } from "@/lib/chartDataOptimization";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

/**
 * TopCategoriesWidget - Адаптивный виджет топ категорий расходов
 *
 * Responsive Design:
 * - Горизонтальная гистограмма (indexAxis: 'y') для лучшей читаемости на мобильных
 * - Адаптивная высота графика и размеры шрифтов
 * - Адаптивное количество меток на оси X
 *
 * Breakpoints и высота:
 * - Mobile (< 640px): h-64 (256px)
 * - Tablet (640px-1024px): h-80 (320px)
 * - Desktop (>= 1024px): h-96 (384px)
 *
 * Adaptive Chart Config:
 * - maxTicksLimit: 5 (mobile) -> 8 (tablet) -> 12 (desktop)
 * - fontSize: 10 (mobile) -> 11 (tablet) -> 12 (desktop)
 *
 * Требования: 3.1, 3.2, 3.4
 */
const SOFT_BAR_COLORS = [
  "rgba(99, 102, 241, 0.75)",
  "rgba(16, 185, 129, 0.75)",
  "rgba(99, 102, 241, 0.55)",
  "rgba(16, 185, 129, 0.55)",
  "rgba(99, 102, 241, 0.4)",
];

interface TopCategory {
  categoryName: string;
  categoryIcon?: string;
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
  // Определяем текущий размер экрана для адаптивной конфигурации
  const { isMobile, isTablet } = useBreakpoint();
  // Получаем адаптивную конфигурацию графика
  const chartConfig = getChartConfig(isMobile, isTablet);

  // Оптимизируем данные для мобильных устройств
  // Требование 10.2: Оптимизация количества отрисовываемых точек данных
  const optimizedCategories = useMemo(
    () => optimizeGenericData(categories || [], isMobile, isTablet),
    [categories, isMobile, isTablet]
  );

  const chartData = useMemo((): ChartData<"bar", number[], string> => {
    if (!optimizedCategories || optimizedCategories.length === 0) {
      return { labels: [], datasets: [] };
    }
    const limitedCategories = optimizedCategories.slice(0, limit);
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
  }, [optimizedCategories, limit]);

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
              const category = optimizedCategories[context.dataIndex];
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
            maxTicksLimit: chartConfig.maxTicksLimit,
            font: {
              size: chartConfig.fontSize,
            },
            callback: (value: unknown): string =>
              typeof value === "number"
                ? formatCurrencyTooltip(value)
                : String(value ?? ""),
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: CHART_COLORS.text,
            font: {
              size: chartConfig.fontSize,
            },
          },
        },
      },
    }),
    [optimizedCategories, chartConfig]
  );

  if (loading) {
    return (
      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="animate-pulse">
            <div className="mb-4 h-6 w-1/2 rounded bg-muted" />
            <div className="h-64 rounded-2xl bg-muted/50" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardContent className="p-6 md:p-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Топ категорий расходов
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
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Топ {limit} категорий расходов
        </h2>
        {/* Адаптивная высота: 256px (mobile) -> 320px (tablet) -> 384px (desktop) */}
        <div className="h-64 sm:h-80 lg:h-96">
          <Bar data={chartData} options={options} />
        </div>
        <div className="mt-6 space-y-3">
          {optimizedCategories.slice(0, limit).map((cat) => (
            <div
              key={`${cat.categoryName}-${cat.totalAmount}`}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                {cat.categoryIcon && (
                  <div className="flex h-6 w-6 items-center justify-center">
                    <CategoryIcon
                      icon={cat.categoryIcon}
                      className="h-4 w-4 text-foreground"
                    />
                  </div>
                )}
                <span className="text-foreground">{cat.categoryName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {formatCurrencyTooltip(cat.totalAmount)}
                </span>
                <span className="text-muted-foreground">
                  ({cat.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

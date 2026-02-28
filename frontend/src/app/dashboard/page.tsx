"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  BalanceCards,
  ExpenseChart,
  TrendChart,
  TopCategoriesWidget,
} from "@/components/dashboard";
import { type DashboardPeriod } from "@/utils/dateRange";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { X } from "lucide-react";

/**
 * DashboardPage - Главная страница дашборда с адаптивными фильтрами
 *
 * Responsive Design:
 * - Адаптивное расположение фильтров и элементов управления
 * - Вертикальная раскладка на мобильных, горизонтальная на desktop
 * - Адаптивные метки кнопок (полные/сокращенные)
 *
 * Filter Layout:
 * - Mobile (< 640px): flex-col (вертикальное расположение всех фильтров)
 * - Desktop (>= 640px): sm:flex-row (горизонтальное расположение)
 *
 * Date Inputs:
 * - Минимальная ширина 120px (min-w-[120px]) для удобного ввода дат
 * - Вертикальное расположение на mobile, горизонтальное на desktop
 *
 * Period Buttons:
 * - Минимальный размер 44x44px (min-h-[44px] min-w-[44px]) для сенсорных экранов
 * - Адаптивные метки: "День/Месяц/Год" на desktop, "Д/М/Г" на mobile
 *   Причина: экономия места на узких экранах при сохранении функциональности
 *
 * Chart Grid:
 * - Mobile (< 1024px): grid-cols-1 (одна колонка)
 * - Desktop (>= 1024px): lg:grid-cols-2 (две колонки)
 *
 * Padding:
 * - Container: px-4 sm:px-6 lg:px-8 (16px -> 24px -> 32px)
 *   Обеспечивает минимальные отступы 16px на мобильных устройствах
 *
 * Требования: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 6.3
 */
function getDefaultDateRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

export default function DashboardPage() {
  const {
    summary,
    trends,
    topCategories,
    loading,
    error,
    loadSummary,
    loadTrends,
    loadTopCategories,
    clearError,
  } = useApp();

  const defaultDates = useMemo(() => getDefaultDateRange(), []);

  const [period, setPeriod] = useState<DashboardPeriod>("day");
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);

  useEffect(() => {
    loadSummary(startDate, endDate);
    loadTrends(period, startDate, endDate);
    loadTopCategories(5, undefined, startDate, endDate);
  }, [period, startDate, endDate, loadSummary, loadTrends, loadTopCategories]);

  const PERIOD_LABELS: Record<DashboardPeriod, string> = {
    day: "День",
    month: "Месяц",
    year: "Год",
  };

  const PERIOD_LABELS_SHORT: Record<DashboardPeriod, string> = {
    day: "Д",
    month: "М",
    year: "Г",
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          {/* Заголовок и кнопки группировки на одной строке */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
              Обзор
            </h1>

            {/* Кнопки группировки без подписи */}
            <div className="flex items-center gap-2">
              {(Object.keys(PERIOD_LABELS) as DashboardPeriod[]).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  size="sm"
                  className="h-9 min-w-[36px] rounded-2xl px-3 text-sm"
                  onClick={() => setPeriod(p)}
                >
                  <span className="hidden sm:inline">{PERIOD_LABELS[p]}</span>
                  <span className="sm:hidden">{PERIOD_LABELS_SHORT[p]}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Даты */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 rounded-2xl bg-input text-foreground"
            />
            <span className="text-muted-foreground">—</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 rounded-2xl bg-input text-foreground"
            />
          </div>
        </div>

        {error && (
          <Card className="mb-6 rounded-2xl border-destructive/50 bg-destructive/10 shadow-sm">
            <CardContent className="flex flex-row items-center justify-between py-4">
              <span className="text-destructive">{error}</span>
              <button
                type="button"
                onClick={clearError}
                className="rounded-2xl p-1 text-destructive hover:text-destructive/80"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </CardContent>
          </Card>
        )}

        <BalanceCards
          totalIncome={summary?.totalIncome ?? 0}
          totalExpense={summary?.totalExpense ?? 0}
          balance={summary?.balance ?? 0}
          displayCurrency={summary?.displayCurrency}
          byCurrency={summary?.byCurrency}
          currencyRates={summary?.currencyRates}
          loading={loading}
        />

        {/* Графики: одна колонка на mobile (< 1024px), две колонки на desktop (>= 1024px) */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TrendChart
            incomeData={trends?.map((t) => ({ date: t.date, amount: t.income })) || []}
            expenseData={
              trends?.map((t) => ({ date: t.date, amount: t.expense })) || []
            }
            loading={loading}
          />
          <ExpenseChart
            data={trends?.map((t) => ({ date: t.date, amount: t.expense })) || []}
            loading={loading}
          />
        </div>

        <div className="mt-6">
          <TopCategoriesWidget
            categories={topCategories || []}
            loading={loading}
            limit={5}
          />
        </div>
      </div>
    </div>
  );
}

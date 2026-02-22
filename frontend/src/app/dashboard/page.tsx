"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  BalanceCards,
  ExpenseChart,
  TrendChart,
  TopCategoriesWidget,
} from "@/components/dashboard";
import { getDateRange, type DashboardPeriod } from "@/utils/dateRange";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { X } from "lucide-react";

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

  const [period, setPeriod] = useState<DashboardPeriod>("month");
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

  return (
    <div className="min-h-full bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
            Обзор
          </h1>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-auto rounded-2xl border-slate-200"
              />
              <span className="text-slate-500">—</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-auto rounded-2xl border-slate-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Группировка:</span>
              {(Object.keys(PERIOD_LABELS) as DashboardPeriod[]).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  size="sm"
                  className="rounded-2xl"
                  onClick={() => setPeriod(p)}
                >
                  {PERIOD_LABELS[p]}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <Card className="mb-6 rounded-2xl border-red-200 bg-red-50 shadow-sm">
            <CardContent className="flex flex-row items-center justify-between py-4">
              <span className="text-red-700">{error}</span>
              <button
                type="button"
                onClick={clearError}
                className="rounded-2xl p-1 text-red-600 hover:text-red-800"
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

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
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

        <div className="mt-8">
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

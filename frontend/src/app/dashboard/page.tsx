"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  SummaryCards,
  ExpenseChart,
  TrendChart,
  TopCategoriesWidget,
} from "@/components/dashboard";

export type DashboardPeriod = "day" | "week" | "month" | "year";

export function getDateRange(period: DashboardPeriod): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  const days =
    period === "day"
      ? 7
      : period === "week"
        ? 7
        : period === "month"
          ? 30
          : 365;
  start.setDate(start.getDate() - days);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
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

  const [period, setPeriod] = useState<DashboardPeriod>("month");
  const { start, end } = useMemo(() => getDateRange(period), [period]);

  useEffect(() => {
    loadSummary(start, end);
    loadTrends(period, start, end);
    loadTopCategories(5, undefined, start, end);
  }, [period, start, end, loadSummary, loadTrends, loadTopCategories]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              ✕
            </button>
          </div>
        )}

        <SummaryCards
          totalIncome={summary?.totalIncome ?? 0}
          totalExpense={summary?.totalExpense ?? 0}
          balance={summary?.balance ?? 0}
          byCurrency={summary?.byCurrency}
          loading={loading}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart
            period={period}
            onPeriodChange={setPeriod}
            incomeData={trends?.map((t) => ({ date: t.date, amount: t.income })) || []}
            expenseData={
              trends?.map((t) => ({ date: t.date, amount: t.expense })) || []
            }
            loading={loading}
          />
          <ExpenseChart
            period={period}
            onPeriodChange={setPeriod}
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

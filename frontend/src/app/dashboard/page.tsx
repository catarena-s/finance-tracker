"use client";

import React, { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  SummaryCards,
  ExpenseChart,
  TrendChart,
  TopCategoriesWidget,
} from "@/components/dashboard";

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

  useEffect(() => {
    loadSummary();
    loadTrends();
    loadTopCategories();
  }, []);

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
          totalIncome={summary?.totalIncome || 0}
          totalExpense={summary?.totalExpenses || 0}
          balance={summary?.balance || 0}
          loading={loading}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
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

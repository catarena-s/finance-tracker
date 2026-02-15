'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { SummaryCards } from '@/components/dashboard';

export default function DashboardPage() {
  const { summary, loading, error, loadSummary, clearError } = useApp();

  useEffect(() => {
    loadSummary();
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
          totalExpense={summary?.totalExpense || 0}
          balance={summary?.balance || 0}
          loading={loading}
        />

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Добро пожаловать!</h2>
          <p className="text-gray-600">
            Здесь будет отображаться аналитика и графики ваших финансов.
          </p>
        </div>
      </div>
    </div>
  );
}

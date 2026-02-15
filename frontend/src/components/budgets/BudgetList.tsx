import React from 'react';
import { Budget } from '@/types/api';
import { BudgetCard } from './BudgetCard';

interface BudgetListProps {
  budgets: Budget[];
  budgetProgress: Record<string, number>; // budgetId -> spent amount
  loading?: boolean;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export function BudgetList({
  budgets,
  budgetProgress,
  loading = false,
  onEdit,
  onDelete,
}: BudgetListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-4 animate-pulse"
            role="status"
            aria-label="Loading"
          >
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Нет бюджетов</h3>
        <p className="mt-1 text-sm text-gray-500">
          Начните с создания нового бюджета
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {budgets.map((budget) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          spent={budgetProgress[budget.id] || 0}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

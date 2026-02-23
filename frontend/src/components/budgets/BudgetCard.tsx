import React from "react";
import { Budget, Category } from "@/types/api";
import { formatCurrency, formatDate } from "@/utils/format";
import { Button } from "@/components/ui";

interface BudgetCardProps {
  budget: Budget;
  category?: Category;
  spent: number;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export function BudgetCard({
  budget,
  category,
  spent,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const budgetAmount = Number(budget.amount);
  const spentAmount = Number(spent);
  const remaining = budgetAmount - spentAmount;
  const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

  const getProgressColor = () => {
    if (percentage < 70) return "bg-green-500";
    if (percentage < 90) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTextColor = () => {
    if (percentage < 70) return "text-green-600";
    if (percentage < 90) return "text-yellow-600";
    return "text-red-600";
  };

  const periodLabel = budget.period === "monthly" ? "Месячный" : "Годовой";
  const currency = budget.currency ?? "RUB";

  return (
    <div className="bg-card rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {category && (
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
                aria-hidden="true"
              />
            )}
            <h3 className="text-lg font-semibold text-foreground truncate">
              {category ? category.name : budget.categoryId}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">{periodLabel}</p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(budget)}
            aria-label="Edit budget"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(budget.id)}
            aria-label="Delete budget"
            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Бюджет:</span>
          <span className="font-medium text-foreground">
            {formatCurrency(budgetAmount, currency)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Потрачено:</span>
          <span className={`font-medium ${getTextColor()}`}>
            {formatCurrency(spentAmount, currency)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Осталось:</span>
          <span
            className={`font-medium ${remaining >= 0 ? "text-foreground" : "text-destructive"}`}
          >
            {formatCurrency(Math.abs(remaining), currency)}
            {remaining < 0 && " (превышение)"}
          </span>
        </div>

        <div className="pt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Использовано</span>
            <span className={`text-sm font-semibold ${getTextColor()}`}>
              {percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Budget usage: ${percentage.toFixed(1)}%`}
            />
          </div>
        </div>

        <div className="pt-2 text-xs text-muted-foreground flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Transaction } from "@/types/api";
import { formatCurrency, formatDate } from "@/utils/format";
import { Button } from "@/components/ui";

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isIncome = transaction.type === "income";
  const amountColor = isIncome ? "text-green-600" : "text-red-600";
  const amountSign = isIncome ? "+" : "-";

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      }}
      aria-expanded={isExpanded}
      aria-label="Transaction card, click to expand"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-lg font-semibold ${amountColor}`}
              aria-label={`${isIncome ? "Income" : "Expense"} amount`}
            >
              {amountSign}
              {formatCurrency(Number(transaction.amount), transaction.currency)}
            </span>
            <span className="text-xs text-gray-500 uppercase">
              {transaction.currency}
            </span>
          </div>

          <div className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Категория:</span> {transaction.categoryId}
          </div>

          {transaction.description && (
            <p className={`text-sm text-gray-700 mb-2 ${isExpanded ? '' : 'line-clamp-2'}`}>
              {transaction.description}
            </p>
          )}

          {isExpanded && (
            <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
              <div className="text-xs text-gray-600">
                <span className="font-medium">ID:</span> {transaction.id}
              </div>
              <div className="text-xs text-gray-600">
                <span className="font-medium">Создано:</span> {formatDate(transaction.createdAt)}
              </div>
              <div className="text-xs text-gray-600">
                <span className="font-medium">Обновлено:</span> {formatDate(transaction.updatedAt)}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
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
              {formatDate(transaction.transactionDate)}
            </span>

            {transaction.isRecurring && (
              <span className="flex items-center gap-1 text-blue-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Повторяющаяся
              </span>
            )}
          </div>
        </div>

        <div className="flex sm:flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(transaction)}
            aria-label="Edit transaction"
            className="flex-1 sm:flex-none"
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
            onClick={() => onDelete(transaction.id)}
            aria-label="Delete transaction"
            className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
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
    </div>
  );
}

import React, { useState } from "react";
import { Transaction } from "@/types/api";
import { formatCurrency, formatDate } from "@/utils/format";
import { Button } from "@/components/ui";

/**
 * TransactionCard - Карточное представление транзакции для мобильных устройств
 *
 * Responsive Design:
 * - Компактное карточное представление для узких экранов
 * - Все ключевые данные отображаются: дата, категория, сумма, описание
 * - Интерактивность: клик для раскрытия дополнительной информации
 *
 * Layout:
 * - Mobile: flex-col (вертикальное расположение элементов)
 * - Tablet+: sm:flex-row (горизонтальное расположение)
 *
 * Text Overflow:
 * - Описание обрезается до 2 строк (line-clamp-2) в свернутом состоянии
 * - Полное описание отображается при раскрытии карточки
 *
 * Accessibility:
 * - Карточка кликабельна (role="button", tabIndex={0})
 * - Поддержка клавиатурной навигации (Enter, Space)
 * - Aria-атрибуты для screen readers
 *
 * Требования: 8.1, 8.2, 8.3, 8.4
 */
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

  // Get category name from transaction object
  const categoryName = (transaction as any).category?.name || transaction.categoryId;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on buttons
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className="rounded-2xl border border-border bg-card p-3 shadow-sm hover:shadow-md transition-[box-shadow] cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      }}
      aria-expanded={isExpanded}
      aria-label="Transaction card, click to expand"
    >
      {/* Первая строка: сумма и иконки действий */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`text-lg font-semibold ${isIncome ? "text-secondary" : "text-foreground"}`}
          aria-label={`${isIncome ? "Income" : "Expense"} amount`}
        >
          {isIncome ? "+" : "−"}
          {formatCurrency(Number(transaction.amount), transaction.currency)}
        </span>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(transaction);
            }}
            aria-label="Edit transaction"
            className="h-8 w-8 p-0 rounded-xl"
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
            onClick={(e) => {
              e.stopPropagation();
              onDelete(transaction.id);
            }}
            aria-label="Delete transaction"
            className="h-8 w-8 p-0 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
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

      {/* Описание */}
      {transaction.description && (
        <p
          className={`text-sm text-foreground mb-2 ${isExpanded ? "" : "line-clamp-2"}`}
        >
          {transaction.description}
        </p>
      )}

      {/* Информация в 2 колонках */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Левая колонка: дата */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <svg
              className="w-3 h-3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(transaction.transactionDate)}</span>
          </div>
        </div>

        {/* Правая колонка: категория и повтор */}
        <div className="space-y-1">
          <div className="text-muted-foreground truncate">
            <span className="font-medium">Категория:</span> {categoryName}
          </div>
          {transaction.isRecurring && (
            <div className="flex items-center gap-1 text-primary">
              <svg
                className="w-3 h-3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Повтор</span>
            </div>
          )}
        </div>
      </div>

      {/* Развернутая информация */}
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-border space-y-1 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">ID:</span> {transaction.id}
          </div>
          <div>
            <span className="font-medium">Создано:</span>{" "}
            {formatDate(transaction.createdAt)}
          </div>
          <div>
            <span className="font-medium">Обновлено:</span>{" "}
            {formatDate(transaction.updatedAt)}
          </div>
        </div>
      )}
    </div>
  );
}

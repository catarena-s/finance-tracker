import React from "react";
import { Transaction } from "@/types/api";
import { TransactionCard } from "./TransactionCard";
import { TransactionTable } from "./TransactionTable";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Pagination } from "@/components/ui";

/**
 * TransactionList - Адаптивный список транзакций
 * 
 * Responsive Design:
 * - Условный рендеринг: таблица на desktop, карточки на mobile
 * - Переключение представления на основе ширины viewport
 * 
 * Breakpoint Logic:
 * - Mobile (< 768px): карточное представление (TransactionCard)
 *   Причина: таблицы плохо работают на узких экранах, карточки обеспечивают
 *   лучшую читаемость и доступность всех данных
 * - Desktop (>= 768px): табличное представление (TransactionTable)
 *   Причина: таблицы эффективны для сканирования больших объемов данных
 *   на широких экранах
 * 
 * Card View Features:
 * - Все ключевые данные видимы: дата, категория, сумма, описание
 * - Обрезка длинных описаний (line-clamp-2)
 * - Интерактивность: клик для раскрытия полной информации
 * 
 * Требования: 8.1, 8.2, 8.3, 8.4, 8.5
 */
interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionList({
  transactions,
  loading = false,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const { width } = useBreakpoint();
  
  // Используем табличное представление на desktop (>= 768px), карточное на mobile (< 768px)
  // Это соответствует требованию 8.1: viewport < 768px должен использовать карточное представление
  const useTableView = width >= 768;

  // Если используем табличное представление, делегируем компоненту TransactionTable
  if (useTableView) {
    return (
      <TransactionTable
        transactions={transactions}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }

  // Карточное представление для мобильных устройств
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-4 animate-pulse"
            role="status"
            aria-label="Loading"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
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
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Нет транзакций</h3>
        <p className="mt-1 text-sm text-gray-500">
          Начните с создания новой транзакции
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

"use client";

import React from "react";
import { RecurringTransaction } from "@/types/api";
import { RecurringTransactionCard } from "./RecurringTransactionCard";

interface RecurringTransactionListProps {
  items: RecurringTransaction[];
  onEdit: (item: RecurringTransaction) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export function RecurringTransactionList({
  items,
  onEdit,
  onDelete,
  onToggleActive,
}: RecurringTransactionListProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        Нет шаблонов повторяющихся транзакций. Создайте первый.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((r) => (
        <li key={r.id}>
          <RecurringTransactionCard
            item={r}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
          />
        </li>
      ))}
    </ul>
  );
}

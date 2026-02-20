"use client";

import React from "react";
import { RecurringTransaction } from "@/types/api";
import { formatCurrency, formatDate } from "@/utils/format";
import { Button } from "@/components/ui";

interface RecurringTransactionCardProps {
  item: RecurringTransaction;
  onEdit: (item: RecurringTransaction) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

const frequencyLabels: Record<string, string> = {
  daily: "Ежедневно",
  weekly: "Еженедельно",
  monthly: "Ежемесячно",
  yearly: "Ежегодно",
};

export function RecurringTransactionCard({
  item,
  onEdit,
  onDelete,
  onToggleActive,
}: RecurringTransactionCardProps) {
  const typeLabel = item.type === "income" ? "Доход" : "Расход";
  const typeBadge =
    item.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {formatCurrency(item.amount, item.currency)}
            {item.interval > 1 ? ` × ${item.interval} ` : " "}
            {frequencyLabels[item.frequency] ?? item.frequency}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Следующее: {formatDate(item.nextOccurrence, "short")}
            {item.endDate ? ` · до ${formatDate(item.endDate, "short")}` : ""}
          </p>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2 ${typeBadge}`}
          >
            {typeLabel}
          </span>
          <span
            className={`ml-2 text-xs ${item.isActive ? "text-green-600" : "text-gray-400"}`}
          >
            {item.isActive ? "Активен" : "Неактивен"}
          </span>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleActive(item.id, !item.isActive)}
          >
            {item.isActive ? "Отключить" : "Включить"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
            Изменить
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(item.id)}>
            Удалить
          </Button>
        </div>
      </div>
    </div>
  );
}

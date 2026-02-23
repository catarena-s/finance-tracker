"use client";

import React from "react";
import { RecurringTransaction } from "@/types/api";
import { RecurringTransactionCard } from "./RecurringTransactionCard";
import { Card, CardContent } from "@/components/ui/shadcn/card";

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
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Нет шаблонов повторяющихся транзакций. Создайте первый.
          </p>
        </CardContent>
      </Card>
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

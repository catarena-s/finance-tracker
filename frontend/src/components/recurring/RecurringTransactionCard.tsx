"use client";

import React from "react";
import { RecurringTransaction } from "@/types/api";
import { formatCurrency, formatDate } from "@/utils/format";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Edit2, Trash2, Power, PowerOff } from "lucide-react";

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
  const typeBadgeClass =
    item.type === "income"
      ? "bg-secondary/20 text-secondary border-secondary/30"
      : "bg-destructive/20 text-destructive border-destructive/30";

  return (
    <Card className="rounded-2xl shadow-sm transition-[box-shadow] duration-200 hover:shadow-md border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {item.name}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeBadgeClass}`}
              >
                {typeLabel}
              </span>
            </div>
            <p className="text-sm text-foreground font-medium mb-1">
              {formatCurrency(item.amount, item.currency)}
              {item.interval > 1 ? ` × ${item.interval} ` : " "}
              {frequencyLabels[item.frequency] ?? item.frequency}
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              Следующее: {formatDate(item.nextOccurrence, "short")}
              {item.endDate ? ` · до ${formatDate(item.endDate, "short")}` : ""}
            </p>
            <div className="flex items-center gap-2">
              {item.isActive ? (
                <span className="inline-flex items-center gap-1 text-xs text-secondary">
                  <Power className="h-3 w-3" />
                  Активен
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <PowerOff className="h-3 w-3" />
                  Неактивен
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Button
              variant={item.isActive ? "outline" : "default"}
              size="sm"
              onClick={() => onToggleActive(item.id, !item.isActive)}
              className="rounded-2xl"
            >
              {item.isActive ? (
                <>
                  <PowerOff className="mr-1.5 h-3.5 w-3.5" />
                  Отключить
                </>
              ) : (
                <>
                  <Power className="mr-1.5 h-3.5 w-3.5" />
                  Включить
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              className="rounded-2xl"
            >
              <Edit2 className="mr-1.5 h-3.5 w-3.5" />
              Изменить
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="rounded-2xl text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Удалить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import React from "react";
import { Category } from "@/types/api";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";
import { Pencil, Trash2 } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const typeLabel = category.type === "income" ? "Доход" : "Расход";
  const isIncome = category.type === "income";

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
              style={{ backgroundColor: `${category.color}20` }}
              aria-label="Иконка категории"
            >
              {category.icon ?? "📁"}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold text-slate-900">
                {category.name}
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={
                    isIncome
                      ? "rounded-lg bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20"
                      : "rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }
                >
                  {typeLabel}
                </Badge>
                <div
                  className="h-4 w-4 rounded-md border border-slate-200"
                  style={{ backgroundColor: category.color }}
                  title={`Цвет: ${category.color}`}
                  aria-label={`Цвет категории: ${category.color}`}
                />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
              onClick={() => onEdit(category)}
              aria-label="Редактировать"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-destructive"
              onClick={() => onDelete(category.id)}
              aria-label="Удалить"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import React from "react";
import { Category } from "@/types/api";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";
import { Pencil, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/utils/categoryIcons";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const typeLabel = category.type === "income" ? "Доход" : "Расход";
  const isIncome = category.type === "income";

  return (
    <Card className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
              style={{ backgroundColor: `${category.color}20` }}
              aria-label="Иконка категории"
            >
              <CategoryIcon
                icon={category.icon}
                className="h-5 w-5"
                style={{ color: category.color }}
              />
              <div
                className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-md border-2 border-white shadow-sm"
                style={{ backgroundColor: category.color }}
                title={`Цвет: ${category.color}`}
                aria-label={`Цвет категории: ${category.color}`}
              />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="truncate text-base font-semibold text-slate-900">
                {category.name}
              </h3>
              <Badge
                variant="secondary"
                className={`mt-1.5 rounded-lg text-xs ${
                  isIncome
                    ? "bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {typeLabel}
              </Badge>
            </div>
          </div>
          <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
              onClick={() => onEdit(category)}
              aria-label="Редактировать"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-destructive"
              onClick={() => onDelete(category.id)}
              aria-label="Удалить"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

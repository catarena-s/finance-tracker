"use client";

import React from "react";
import { Category } from "@/types/api";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";
import { Pencil, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/utils/categoryIcons";

/**
 * CategoryCard - Адаптивная карточка категории
 * 
 * Responsive Design:
 * - Используется в сетке с адаптивным количеством колонок (родительский компонент)
 * - Обрезка длинных названий с многоточием (text-overflow: ellipsis)
 * - Адаптивное отображение кнопок действий
 * 
 * Grid Layout (родительский компонент):
 * - Mobile (< 640px): grid-cols-1 (одна колонка)
 * - Tablet (640px-1024px): sm:grid-cols-2 (две колонки)
 * - Desktop (>= 1024px): lg:grid-cols-3 (три колонки)
 * 
 * Adaptive Button Behavior:
 * - Mobile: кнопки всегда видимы (opacity-100) для удобства на сенсорных экранах
 * - Desktop: кнопки появляются при hover (sm:opacity-0 sm:group-hover:opacity-100)
 * 
 * Button Sizes:
 * - Mobile: h-9 w-9 (36x36px) - увеличенный размер для сенсорных экранов
 * - Desktop: sm:h-8 sm:w-8 (32x32px) - стандартный размер
 * 
 * Icon Proportions:
 * - Иконка категории: h-5 w-5 (20x20px) - сохраняет пропорции 1:1
 * - Цветовой индикатор: h-3.5 w-3.5 (14x14px) - сохраняет пропорции 1:1
 * 
 * Требования: 5.1, 5.2, 5.3, 5.4, 5.5
 */
interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const typeLabel = category.type === "income" ? "Доход" : "Расход";
  const isIncome = category.type === "income";

  return (
    <Card className="group rounded-2xl border border-border bg-card shadow-sm transition-[box-shadow,border-color] duration-200 hover:shadow-md hover:border-border/80">
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
                className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-md border-2 border-card shadow-sm"
                style={{ backgroundColor: category.color }}
                title={`Цвет: ${category.color}`}
                aria-label={`Цвет категории: ${category.color}`}
              />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              {/* Обрезка длинных названий с многоточием (text-overflow: ellipsis) */}
              <h3 className="truncate text-base font-semibold text-foreground">
                {category.name}
              </h3>
              <Badge
                variant="secondary"
                className={`mt-1.5 rounded-lg text-xs ${
                  isIncome
                    ? "bg-secondary/10 text-secondary hover:bg-secondary/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {typeLabel}
              </Badge>
            </div>
          </div>
          {/* Кнопки действий: всегда видимы на mobile (opacity-100), появляются при hover на desktop (sm:opacity-0 sm:group-hover:opacity-100) */}
          <div className="flex shrink-0 gap-0.5 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
            {/* Увеличенный размер на mobile (36x36px) для сенсорных экранов, стандартный на desktop (32x32px) */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg text-muted-foreground transition-[background-color,color] duration-200 hover:bg-muted hover:text-foreground sm:h-8 sm:w-8"
              onClick={() => onEdit(category)}
              aria-label="Редактировать"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg text-muted-foreground transition-[background-color,color] duration-200 hover:bg-destructive/10 hover:text-destructive sm:h-8 sm:w-8"
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

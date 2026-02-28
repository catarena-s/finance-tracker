"use client";

import React from "react";
import { Category } from "@/types/api";
import { CategoryCard } from "./CategoryCard";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { FolderTree } from "lucide-react";

interface CategoryListProps {
  categories: Category[];
  loading?: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryList({
  categories,
  loading = false,
  onEdit,
  onDelete,
}: CategoryListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(8)].map((_, index) => (
          <Card
            key={index}
            className="rounded-2xl border border-border bg-card shadow-sm"
          >
            <CardContent className="p-5">
              <div className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-3 w-16 rounded bg-muted/50" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Card className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm md:p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <FolderTree className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Нет категорий</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Начните с создания новой категории
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const incomeCategories = categories.filter((cat) => cat.type === "income");
  const expenseCategories = categories.filter((cat) => cat.type === "expense");

  return (
    <div className="space-y-10">
      {incomeCategories.length > 0 && (
        <div>
          <div className="mb-5 flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Доходы</h2>
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-lg bg-secondary/10 px-2 text-xs font-medium text-secondary">
              {incomeCategories.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {incomeCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {expenseCategories.length > 0 && (
        <div>
          <div className="mb-5 flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Расходы</h2>
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-lg bg-muted px-2 text-xs font-medium text-muted-foreground">
              {expenseCategories.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expenseCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

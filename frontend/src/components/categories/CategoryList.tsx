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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <Card
            key={index}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <CardContent className="p-6 md:p-8">
              <div className="animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-24 rounded bg-slate-200" />
                    <div className="h-4 w-16 rounded bg-slate-100" />
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
      <Card className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm md:p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <FolderTree className="h-7 w-7 text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Нет категорий
            </h3>
            <p className="mt-1 text-sm text-slate-500">
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
    <div className="space-y-8">
      {incomeCategories.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Доходы
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Расходы
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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

import React, { useState, useEffect } from "react";
import { Category } from "@/types/api";
import { Select, DatePicker, Button } from "@/components/ui";

interface TransactionFiltersProps {
  categories: Category[];
  onFilterChange: (filters: TransactionFilterValues) => void;
}

export interface TransactionFilterValues {
  type?: "income" | "expense" | "";
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export function TransactionFilters({
  categories,
  onFilterChange,
}: TransactionFiltersProps) {
  // Устанавливаем даты по умолчанию: 1-е число текущего месяца - текущая дата
  const getDefaultDates = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Форматируем в YYYY-MM-DD в локальном времени
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDate(firstDayOfMonth),
      endDate: formatDate(today),
    };
  };

  const defaultDates = getDefaultDates();

  const [filters, setFilters] = useState<TransactionFilterValues>({
    type: "",
    categoryId: "",
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate,
  });

  const handleFilterChange = (key: keyof TransactionFilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };

    // Если меняется тип транзакции, сбрасываем выбранную категорию
    if (key === "type" && filters.categoryId) {
      const selectedCategory = categories.find((c) => c.id === filters.categoryId);
      if (selectedCategory && value && selectedCategory.type !== value) {
        newFilters.categoryId = "";
      }
    }

    // Если выбирается категория, автоматически устанавливаем соответствующий тип
    if (key === "categoryId" && value) {
      const selectedCategory = categories.find((c) => c.id === value);
      if (selectedCategory) {
        newFilters.type = selectedCategory.type;
      }
    }

    setFilters(newFilters);

    // Очищаем пустые значения перед отправкой на backend
    const cleanedFilters: TransactionFilterValues = {};
    if (newFilters.type && newFilters.type !== ("" as any)) {
      cleanedFilters.type = newFilters.type as "income" | "expense";
    }
    if (newFilters.categoryId && newFilters.categoryId !== "") {
      cleanedFilters.categoryId = newFilters.categoryId;
    }
    if (newFilters.startDate) {
      cleanedFilters.startDate = newFilters.startDate;
    }
    if (newFilters.endDate) {
      cleanedFilters.endDate = newFilters.endDate;
    }

    onFilterChange(cleanedFilters);
  };

  const handleClear = () => {
    const clearedFilters: TransactionFilterValues = {
      type: "",
      categoryId: "",
      startDate: defaultDates.startDate,
      endDate: defaultDates.endDate,
    };
    setFilters(clearedFilters);

    // Очищаем пустые значения перед отправкой
    const cleanedForBackend: TransactionFilterValues = {};
    if (clearedFilters.startDate) {
      cleanedForBackend.startDate = clearedFilters.startDate;
    }
    if (clearedFilters.endDate) {
      cleanedForBackend.endDate = clearedFilters.endDate;
    }
    onFilterChange(cleanedForBackend);
  };

  const hasActiveFilters =
    filters.type !== "" ||
    filters.categoryId !== "" ||
    filters.startDate !== defaultDates.startDate ||
    filters.endDate !== defaultDates.endDate;

  const typeOptions = [
    { value: "", label: "Все типы" },
    { value: "income", label: "Доходы" },
    { value: "expense", label: "Расходы" },
  ];

  const categoryOptions = [
    { value: "", label: "Все категории" },
    ...(categories || [])
      .filter((cat) => !filters.type || cat.type === filters.type)
      .map((cat) => ({
        value: cat.id,
        label: `${cat.icon} ${cat.name}`,
      })),
  ];

  return (
    <div className="rounded-2xl border border-border bg-card shadow-fintech p-3 mb-6 sm:p-4">
      <div className="flex flex-col gap-3">
        {/* Первая строка: Тип и Категория */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="min-w-0">
            <Select
              label="Тип"
              options={typeOptions}
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value as any)}
            />
          </div>

          <div className="min-w-0">
            <Select
              label="Категория"
              options={categoryOptions}
              value={filters.categoryId}
              onChange={(e) => handleFilterChange("categoryId", e.target.value)}
            />
          </div>
        </div>

        {/* Вторая строка: Даты */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="min-w-0">
            <DatePicker
              label="Дата от"
              value={filters.startDate}
              onChange={(value) => handleFilterChange("startDate", value)}
              maxDate={filters.endDate || undefined}
            />
          </div>

          <div className="min-w-0">
            <DatePicker
              label="Дата до"
              value={filters.endDate}
              onChange={(value) => handleFilterChange("endDate", value)}
              minDate={filters.startDate || undefined}
            />
          </div>
        </div>

        {/* Кнопка очистки */}
        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="md"
            onClick={handleClear}
            className="w-full sm:w-auto sm:self-start"
          >
            Очистить
          </Button>
        )}
      </div>
    </div>
  );
}

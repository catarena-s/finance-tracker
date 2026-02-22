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

  // Применяем фильтры по умолчанию при монтировании
  useEffect(() => {
    onFilterChange(filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (key: keyof TransactionFilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters: TransactionFilterValues = {
      type: "",
      categoryId: "",
      startDate: defaultDates.startDate,
      endDate: defaultDates.endDate,
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
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
    ...(categories || []).map((cat) => ({
      value: cat.id,
      label: `${cat.icon} ${cat.name}`,
    })),
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-end gap-4">
        <div className="w-full sm:w-auto sm:min-w-[150px]">
          <Select
            label="Тип"
            options={typeOptions}
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value as any)}
          />
        </div>

        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <Select
            label="Категория"
            options={categoryOptions}
            value={filters.categoryId}
            onChange={(e) => handleFilterChange("categoryId", e.target.value)}
          />
        </div>

        <div className="w-full sm:w-auto sm:min-w-[150px]">
          <DatePicker
            label="Дата от"
            value={filters.startDate}
            onChange={(value) => handleFilterChange("startDate", value)}
            maxDate={filters.endDate || undefined}
          />
        </div>

        <div className="w-full sm:w-auto sm:min-w-[150px]">
          <DatePicker
            label="Дата до"
            value={filters.endDate}
            onChange={(value) => handleFilterChange("endDate", value)}
            minDate={filters.startDate || undefined}
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="md"
            onClick={handleClear}
            className="w-full sm:w-auto"
          >
            Очистить
          </Button>
        )}
      </div>
    </div>
  );
}

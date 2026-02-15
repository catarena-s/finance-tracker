import React, { useState } from "react";
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
  const [filters, setFilters] = useState<TransactionFilterValues>({
    type: "",
    categoryId: "",
    startDate: "",
    endDate: "",
  });

  const handleFilterChange = (key: keyof TransactionFilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters: TransactionFilterValues = {
      type: "",
      categoryId: "",
      startDate: "",
      endDate: "",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

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

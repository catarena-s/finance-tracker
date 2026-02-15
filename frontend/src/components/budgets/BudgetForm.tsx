import React from "react";
import { useForm } from "react-hook-form";
import { Budget, Category } from "@/types/api";
import { Select, DatePicker, CurrencyInput, Button } from "@/components/ui";
import { validateAmount, validateDate, validateDateRange } from "@/utils/validation";

interface BudgetFormProps {
  budget?: Budget;
  categories: Category[];
  onSubmit: (data: BudgetFormData) => Promise<void>;
  onCancel: () => void;
}

export interface BudgetFormData {
  categoryId: string;
  amount: number;
  period: "monthly" | "yearly";
  startDate: string;
  endDate: string;
}

export function BudgetForm({
  budget,
  categories,
  onSubmit,
  onCancel,
}: BudgetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<BudgetFormData>({
    defaultValues: budget
      ? {
          categoryId: budget.categoryId,
          amount: Number(budget.amount),
          period: budget.period,
          startDate: budget.startDate,
          endDate: budget.endDate,
        }
      : {
          categoryId: "",
          amount: 0,
          period: "monthly",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
        },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const handleFormSubmit = async (data: BudgetFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  // Filter only expense categories for budgets
  const expenseCategories = (categories || []).filter((cat) => cat.type === "expense");
  const categoryOptions = expenseCategories.map((cat) => ({
    value: cat.id,
    label: `${cat.icon} ${cat.name}`,
  }));

  const periodOptions = [
    { value: "monthly", label: "Месячный" },
    { value: "yearly", label: "Годовой" },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Select
        label="Категория"
        options={categoryOptions}
        placeholder="Выберите категорию"
        error={errors.categoryId?.message}
        {...register("categoryId", {
          required: "Выберите категорию",
        })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Сумма бюджета
        </label>
        <CurrencyInput
          value={watch("amount")}
          onChange={(value) => setValue("amount", value)}
          error={errors.amount?.message}
        />
      </div>

      <Select
        label="Период"
        options={periodOptions}
        error={errors.period?.message}
        {...register("period", {
          required: "Выберите период",
        })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Дата начала
        </label>
        <DatePicker
          value={watch("startDate")}
          onChange={(value) => setValue("startDate", value)}
          error={errors.startDate?.message}
          maxDate={endDate || undefined}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Дата окончания
        </label>
        <DatePicker
          value={watch("endDate")}
          onChange={(value) => setValue("endDate", value)}
          error={errors.endDate?.message}
          minDate={startDate || undefined}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="flex-1"
        >
          {budget ? "Обновить" : "Создать"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}

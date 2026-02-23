import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Transaction, Category } from "@/types/api";
import { Input, DatePicker, CurrencyInput, Button } from "@/components/ui";
import { CategorySelect } from "@/components/ui/CategorySelect";
import { Select } from "@/components/ui/Select";
import { validateAmount, validateDate, validateString } from "@/utils/validation";
import { CategoryIcon } from "@/utils/categoryIcons";

interface TransactionFormProps {
  transaction?: Transaction;
  categories: Category[];
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
}

export interface TransactionFormData {
  type: "income" | "expense";
  amount: number;
  currency: string;
  categoryId: string;
  description?: string;
  transactionDate: string;
  isRecurring: boolean;
}

export function TransactionForm({
  transaction,
  categories,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<TransactionFormData>({
    defaultValues: transaction
      ? {
          type: transaction.type,
          amount: Number(transaction.amount),
          currency: transaction.currency,
          categoryId: transaction.categoryId,
          description: transaction.description || "",
          transactionDate: transaction.transactionDate,
          isRecurring: transaction.isRecurring || false,
        }
      : {
          type: "expense",
          amount: 0,
          currency: "USD",
          categoryId: "",
          description: "",
          transactionDate: new Date().toISOString().split("T")[0],
          isRecurring: false,
        },
  });

  const selectedType = watch("type");
  const filteredCategories = (categories || []).filter(
    (cat) => cat.type === selectedType
  );

  useEffect(() => {
    // Reset category if it doesn't match the selected type
    const currentCategoryId = watch("categoryId");
    const isValidCategory = filteredCategories.some(
      (cat) => cat.id === currentCategoryId
    );
    if (!isValidCategory && filteredCategories.length > 0) {
      setValue("categoryId", "");
    }
  }, [selectedType, filteredCategories, setValue, watch]);

  const handleFormSubmit = async (data: TransactionFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const typeOptions = [
    { value: "income", label: "Доход" },
    { value: "expense", label: "Расход" },
  ];

  const categoryOptions = filteredCategories.map((cat) => ({
    value: cat.id,
    label: cat.name,
    icon: cat.icon,
  }));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Select
        label="Тип транзакции"
        options={typeOptions}
        error={errors.type?.message}
        {...register("type", {
          required: "Выберите тип транзакции",
        })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Сумма</label>
        <CurrencyInput
          value={watch("amount")}
          onChange={(value) => setValue("amount", value)}
          currency={watch("currency")}
          error={errors.amount?.message}
        />
      </div>

      <Select
        label="Валюта"
        options={[
          { value: "USD", label: "USD ($)" },
          { value: "EUR", label: "EUR (€)" },
          { value: "GBP", label: "GBP (£)" },
          { value: "RUB", label: "RUB (₽)" },
        ]}
        error={errors.currency?.message}
        {...register("currency", {
          required: "Выберите валюту",
        })}
      />

      <CategorySelect
        label="Категория"
        options={categoryOptions}
        placeholder="Выберите категорию"
        error={errors.categoryId?.message}
        value={watch("categoryId")}
        {...register("categoryId", {
          required: "Выберите категорию",
        })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Дата транзакции
        </label>
        <DatePicker
          value={watch("transactionDate")}
          onChange={(value) => setValue("transactionDate", value)}
          error={errors.transactionDate?.message}
          maxDate={new Date().toISOString().split("T")[0]}
        />
      </div>

      <Input
        label="Описание (необязательно)"
        type="text"
        placeholder="Добавьте описание..."
        error={errors.description?.message}
        {...register("description", {
          validate: (value) => {
            if (!value) return true;
            return validateString(value, { maxLength: 500 }) || true;
          },
        })}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isRecurring"
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          {...register("isRecurring")}
        />
        <label htmlFor="isRecurring" className="text-sm text-gray-700">
          Повторяющаяся транзакция
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="flex-1"
        >
          {transaction ? "Обновить" : "Создать"}
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

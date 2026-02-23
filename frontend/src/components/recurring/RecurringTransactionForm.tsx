"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input, DatePicker, CurrencyInput } from "@/components/ui";
import { Button } from "@/components/ui/shadcn/button";
import { CategorySelect } from "@/components/ui/CategorySelect";
import type {
  RecurringTransaction,
  RecurringTransactionCreate,
  Category,
} from "@/types/api";

interface RecurringTransactionFormProps {
  item?: RecurringTransaction | null;
  categories: Category[];
  onSubmit: (data: RecurringTransactionCreate) => Promise<void>;
  onCancel: () => void;
}

export type RecurringFormData = RecurringTransactionCreate;

const FREQUENCIES = [
  { value: "daily", label: "Ежедневно" },
  { value: "weekly", label: "Еженедельно" },
  { value: "monthly", label: "Ежемесячно" },
  { value: "yearly", label: "Ежегодно" },
];

export function RecurringTransactionForm({
  item,
  categories,
  onSubmit,
  onCancel,
}: RecurringTransactionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    setError,
    reset,
    control,
  } = useForm<RecurringFormData>({
    defaultValues: item
      ? {
          name: item.name,
          amount: item.amount,
          currency: item.currency,
          categoryId: item.categoryId,
          description: item.description ?? "",
          type: item.type,
          frequency: item.frequency,
          interval: item.interval,
          startDate: item.startDate,
          endDate: item.endDate ?? undefined,
        }
      : {
          name: "",
          amount: 0,
          currency: "RUB",
          description: "",
          type: "expense",
          frequency: "monthly",
          interval: 1,
          startDate: new Date().toISOString().split("T")[0],
          endDate: undefined,
        },
  });

  const selectedType = watch("type");
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  useEffect(() => {
    const current = watch("categoryId");
    const valid = filteredCategories.some((c) => c.id === current);
    if (!valid && filteredCategories.length > 0) {
      setValue("categoryId", "", { shouldValidate: false });
    }
  }, [selectedType, filteredCategories, setValue, watch]);

  const handleFormSubmit = async (data: RecurringFormData) => {
    if (!data.categoryId || data.categoryId.trim() === "") {
      setError("categoryId", { type: "required", message: "Выберите категорию" });
      return;
    }
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Название"
        {...register("name", { required: "Обязательное поле" })}
        error={errors.name?.message}
      />
      <div className="flex gap-2">
        <div className="flex-1">
          <CurrencyInput
            label="Сумма"
            value={watch("amount")}
            onChange={(v) => setValue("amount", v)}
            currency={watch("currency")}
          />
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-foreground mb-1">
            Валюта
          </label>
          <select
            className="w-full border border-input rounded-2xl px-3 py-2 bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            value={watch("currency")}
            onChange={(e) => setValue("currency", e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="RUB">RUB</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Тип</label>
        <select
          className="w-full border border-input rounded-2xl px-3 py-2 bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          value={watch("type")}
          onChange={(e) => setValue("type", e.target.value as "income" | "expense")}
        >
          <option value="income">Доход</option>
          <option value="expense">Расход</option>
        </select>
      </div>
      <Controller
        name="categoryId"
        control={control}
        rules={{
          required: "Выберите категорию",
          validate: (value) => {
            if (!value || value.trim() === "") {
              return "Выберите категорию";
            }
            return true;
          },
        }}
        render={({ field }) => (
          <CategorySelect
            label="Категория"
            placeholder="Выберите категорию"
            options={filteredCategories.map((c) => ({
              value: c.id,
              label: c.name,
              icon: c.icon,
            }))}
            {...field}
            error={errors.categoryId?.message}
          />
        )}
      />
      <Input label="Описание" {...register("description")} />
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Повтор</label>
        <div className="flex gap-2">
          <select
            className="flex-1 border border-input rounded-2xl px-3 py-2 bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            value={watch("frequency")}
            onChange={(e) =>
              setValue("frequency", e.target.value as RecurringFormData["frequency"])
            }
          >
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            className="w-20 border border-input rounded-2xl px-3 py-2 bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            {...register("interval", { valueAsNumber: true, min: 1 })}
          />
        </div>
      </div>
      <DatePicker
        label="Дата начала"
        value={watch("startDate")}
        onChange={(v) => setValue("startDate", v)}
      />
      <DatePicker
        label="Дата окончания (необязательно)"
        value={watch("endDate") ?? ""}
        onChange={(v) => setValue("endDate", v || undefined)}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="rounded-2xl"
        >
          Отмена
        </Button>
        <Button type="submit" disabled={isSubmitting} className="rounded-2xl">
          {item ? "Сохранить" : "Создать"}
        </Button>
      </div>
    </form>
  );
}

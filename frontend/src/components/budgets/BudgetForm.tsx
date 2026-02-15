import React from 'react';
import { useForm } from 'react-hook-form';
import { Budget, Category } from '@/types/api';
import { Select, DatePicker, CurrencyInput, Button } from '@/components/ui';
import { validateAmount, validateDate, validateDateRange } from '@/utils/validation';

interface BudgetFormProps {
  budget?: Budget;
  categories: Category[];
  onSubmit: (data: BudgetFormData) => Promise<void>;
  onCancel: () => void;
}

export interface BudgetFormData {
  categoryId: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
}

export function BudgetForm({ budget, categories, onSubmit, onCancel }: BudgetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
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
          categoryId: '',
          amount: 0,
          period: 'monthly',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
        },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const handleFormSubmit = async (data: BudgetFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  // Filter only expense categories for budgets
  const expenseCategories = categories.filter((cat) => cat.type === 'expense');
  const categoryOptions = expenseCategories.map((cat) => ({
    value: cat.id,
    label: `${cat.icon} ${cat.name}`,
  }));

  const periodOptions = [
    { value: 'monthly', label: 'Месячный' },
    { value: 'yearly', label: 'Годовой' },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Select
        label="Категория"
        options={categoryOptions}
        placeholder="Выберите категорию"
        error={errors.categoryId?.message}
        {...register('categoryId', {
          required: 'Выберите категорию',
        })}
      />

      <CurrencyInput
        label="Сумма бюджета"
        error={errors.amount?.message}
        {...register('amount', {
          required: 'Введите сумму',
          validate: (value) => {
            const result = validateAmount(Number(value));
            return result.valid || result.error || 'Неверная сумма';
          },
        })}
      />

      <Select
        label="Период"
        options={periodOptions}
        error={errors.period?.message}
        {...register('period', {
          required: 'Выберите период',
        })}
      />

      <DatePicker
        label="Дата начала"
        error={errors.startDate?.message}
        maxDate={endDate || undefined}
        {...register('startDate', {
          required: 'Выберите дату начала',
          validate: (value) => {
            const result = validateDate(value);
            if (!result.valid) return result.error || 'Неверная дата';

            if (endDate) {
              const rangeResult = validateDateRange(value, endDate);
              return rangeResult.valid || rangeResult.error || 'Неверный диапазон дат';
            }

            return true;
          },
        })}
      />

      <DatePicker
        label="Дата окончания"
        error={errors.endDate?.message}
        minDate={startDate || undefined}
        {...register('endDate', {
          required: 'Выберите дату окончания',
          validate: (value) => {
            const result = validateDate(value);
            if (!result.valid) return result.error || 'Неверная дата';

            if (startDate) {
              const rangeResult = validateDateRange(startDate, value);
              return rangeResult.valid || rangeResult.error || 'Дата окончания должна быть после даты начала';
            }

            return true;
          },
        })}
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="flex-1"
        >
          {budget ? 'Обновить' : 'Создать'}
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

import React from 'react';
import { useForm } from 'react-hook-form';
import { Category } from '@/types/api';
import { Input, Select, Button } from '@/components/ui';
import { validateString, validateHexColor } from '@/utils/validation';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
}

export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

const commonIcons = [
  '💰', '💼', '📈', '🎁', '💵', // Income
  '🛒', '🚗', '🏠', '🎬', '⚕️', '📚', '👔', '🍽️', '📦', '✈️', // Expense
];

const commonColors = [
  '#4CAF50', '#8BC34A', '#009688', '#2196F3', '#3F51B5',
  '#9C27B0', '#E91E63', '#F44336', '#FF5722', '#FF9800',
  '#FFC107', '#607D8B',
];

export function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<CategoryFormData>({
    defaultValues: category
      ? {
          name: category.name,
          icon: category.icon,
          color: category.color,
          type: category.type,
        }
      : {
          name: '',
          icon: '📦',
          color: '#607D8B',
          type: 'expense',
        },
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const typeOptions = [
    { value: 'income', label: 'Доход' },
    { value: 'expense', label: 'Расход' },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Название"
        type="text"
        placeholder="Например: Продукты"
        error={errors.name?.message}
        {...register('name', {
          required: 'Введите название категории',
          validate: (value) => validateString(value, { minLength: 1, maxLength: 100 }) || true,
        })}
      />

      <Select
        label="Тип"
        options={typeOptions}
        error={errors.type?.message}
        {...register('type', {
          required: 'Выберите тип категории',
        })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Иконка
        </label>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 border-gray-300"
            style={{ backgroundColor: `${selectedColor}20` }}
          >
            {selectedIcon}
          </div>
          <Input
            type="text"
            placeholder="Введите эмодзи"
            error={errors.icon?.message}
            {...register('icon', {
              required: 'Выберите иконку',
              validate: (value) => validateString(value, { minLength: 1, maxLength: 10 }) || true,
            })}
          />
        </div>
        <div className="grid grid-cols-10 gap-2">
          {commonIcons.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => setValue('icon', icon)}
              className={`w-10 h-10 rounded flex items-center justify-center text-xl hover:bg-gray-100 transition-colors ${
                selectedIcon === icon ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-50'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Цвет
        </label>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded border-2 border-gray-300"
            style={{ backgroundColor: selectedColor }}
          />
          <Input
            type="text"
            placeholder="#000000"
            error={errors.color?.message}
            {...register('color', {
              required: 'Выберите цвет',
              validate: (value) => validateHexColor(value) || true,
            })}
          />
        </div>
        <div className="grid grid-cols-12 gap-2">
          {commonColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className={`w-8 h-8 rounded border-2 transition-all ${
                selectedColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="flex-1"
        >
          {category ? 'Обновить' : 'Создать'}
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

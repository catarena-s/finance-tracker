import React from "react";
import { useForm } from "react-hook-form";
import { Category } from "@/types/api";
import { Input, Select, Button } from "@/components/ui";
import { validateString, validateHexColor } from "@/utils/validation";
import { availableIcons, CategoryIcon } from "@/utils/categoryIcons";

/**
 * CategoryForm - Форма создания/редактирования категории
 *
 * Responsive Design:
 * - Вертикальное расположение полей на мобильных устройствах
 * - Горизонтальное расположение некоторых элементов на desktop
 *
 * Form Layout:
 * - Все основные поля располагаются вертикально (одна колонка)
 * - Элементы выбора цвета: flex-col sm:flex-row (вертикально на mobile, горизонтально на desktop)
 *
 * Требования: 4.3
 */
interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
}

export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
}

const commonColors = [
  "#4CAF50",
  "#8BC34A",
  "#009688",
  "#2196F3",
  "#3F51B5",
  "#9C27B0",
  "#E91E63",
  "#F44336",
  "#FF5722",
  "#FF9800",
  "#FFC107",
  "#607D8B",
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
          name: "",
          icon: "📦",
          color: "#607D8B",
          type: "expense",
        },
  });

  const selectedColor = watch("color");
  const selectedIcon = watch("icon");

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const typeOptions = [
    { value: "income", label: "Доход" },
    { value: "expense", label: "Расход" },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Название"
        type="text"
        placeholder="Например: Продукты"
        error={errors.name?.message}
        {...register("name", {
          required: "Введите название категории",
          validate: (value) =>
            validateString(value, { minLength: 1, maxLength: 100 }) || true,
        })}
      />

      <Select
        label="Тип"
        options={typeOptions}
        error={errors.type?.message}
        {...register("type", {
          required: "Выберите тип категории",
        })}
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Иконка</label>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-border"
            style={{ backgroundColor: `${selectedColor}20` }}
          >
            <CategoryIcon
              icon={selectedIcon}
              className="h-6 w-6"
              style={{ color: selectedColor }}
            />
          </div>
          <span className="text-sm text-foreground">
            {availableIcons.find((i) => i.emoji === selectedIcon)?.name ||
              "Выберите иконку"}
          </span>
        </div>
        <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
          {availableIcons.map((iconItem) => {
            const IconComponent = iconItem.icon;
            return (
              <button
                key={iconItem.emoji}
                type="button"
                onClick={() => setValue("icon", iconItem.emoji)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center hover:bg-muted transition-[background-color,transform] ${
                  selectedIcon === iconItem.emoji
                    ? "bg-primary/10 ring-2 ring-primary"
                    : "bg-muted/50"
                }`}
                title={iconItem.name}
              >
                <IconComponent className="h-5 w-5 text-foreground" />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Цвет</label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded border-2 border-border"
            style={{ backgroundColor: selectedColor }}
          />
          <Input
            type="text"
            placeholder="#000000"
            error={errors.color?.message}
            {...register("color", {
              required: "Выберите цвет",
              validate: (value) => validateHexColor(value) || true,
            })}
          />
        </div>
        <div className="grid grid-cols-10 sm:grid-cols-12 gap-2">
          {commonColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue("color", color)}
              className={`w-8 h-8 rounded border-2 transition-[border-color,transform] ${
                selectedColor === color
                  ? "border-foreground scale-110"
                  : "border-border"
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
          {category ? "Обновить" : "Создать"}
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

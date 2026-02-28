import React, { SelectHTMLAttributes, forwardRef } from "react";
import { CategoryIcon } from "@/utils/categoryIcons";

interface CategoryOption {
  value: string;
  label: string;
  icon?: string;
}

interface CategorySelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: CategoryOption[];
  placeholder?: string;
}

export const CategorySelect = forwardRef<HTMLSelectElement, CategorySelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      className = "",
      id,
      value,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;
    const hasError = Boolean(error);

    // Найти выбранную опцию для отображения иконки
    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {selectedOption?.icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-10">
              <CategoryIcon
                icon={selectedOption.icon}
                className="h-4 w-4 text-muted-foreground"
              />
            </div>
          )}
          <select
            ref={ref}
            id={selectId}
            value={value}
            className={`
              block w-full py-2
              ${selectedOption?.icon ? "pl-10 pr-10" : "px-3 pr-10"}
              border rounded-lg
              text-foreground
              bg-input
              focus:outline-none focus:ring-2 focus:ring-offset-0
              transition-[border-color,box-shadow] duration-200
              disabled:bg-muted disabled:cursor-not-allowed
              appearance-none
              ${
                hasError
                  ? "border-destructive focus:ring-destructive focus:border-destructive"
                  : "border-border focus:ring-primary focus:border-primary"
              }
              ${className}
            `}
            aria-invalid={hasError}
            aria-describedby={
              [errorId, helperId].filter(Boolean).join(" ") || undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

CategorySelect.displayName = "CategorySelect";

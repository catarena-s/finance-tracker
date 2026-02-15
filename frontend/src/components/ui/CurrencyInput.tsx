import React, { forwardRef, useState, useEffect } from "react";
import { Input } from "./Input";

interface CurrencyInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  value?: number | string;
  onChange?: (value: number) => void;
  currency?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  placeholder?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      label,
      error,
      helperText,
      value,
      onChange,
      currency = "USD",
      disabled,
      required,
      id,
      placeholder = "0.00",
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState("");

    useEffect(() => {
      if (value !== undefined && value !== "") {
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        if (!isNaN(numValue)) {
          setDisplayValue(numValue.toFixed(2));
        }
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Allow empty value
      if (inputValue === "") {
        setDisplayValue("");
        onChange?.(0);
        return;
      }

      // Allow only numbers and one decimal point
      const regex = /^\d*\.?\d{0,2}$/;
      if (regex.test(inputValue)) {
        setDisplayValue(inputValue);
        const numValue = parseFloat(inputValue);
        if (!isNaN(numValue)) {
          onChange?.(numValue);
        }
      }
    };

    const handleBlur = () => {
      if (displayValue && displayValue !== "") {
        const numValue = parseFloat(displayValue);
        if (!isNaN(numValue)) {
          setDisplayValue(numValue.toFixed(2));
        }
      }
    };

    const currencySymbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      RUB: "₽",
    };

    const symbol = currencySymbols[currency] || currency;

    return (
      <div className="relative">
        <Input
          ref={ref}
          id={id}
          type="text"
          label={label}
          error={error}
          helperText={helperText}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          inputMode="decimal"
          className="pl-8"
        />
        <span className="absolute left-3 top-[2.125rem] text-gray-500 pointer-events-none">
          {symbol}
        </span>
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

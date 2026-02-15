import React, { forwardRef } from 'react';
import { Input } from './Input';

interface DatePickerProps {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, helperText, value, onChange, minDate, maxDate, disabled, required, id }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <Input
        ref={ref}
        id={id}
        type="date"
        label={label}
        error={error}
        helperText={helperText}
        value={value}
        onChange={handleChange}
        min={minDate}
        max={maxDate}
        disabled={disabled}
        required={required}
        inputMode="numeric"
      />
    );
  }
);

DatePicker.displayName = 'DatePicker';

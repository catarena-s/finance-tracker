import React, { InputHTMLAttributes, forwardRef } from "react";

type InputType = "text" | "number" | "email" | "password" | "date";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  type?: InputType;
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type = "text", label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const hasError = Boolean(error);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            block w-full px-3 py-2 rounded-xl border
            text-foreground placeholder-muted-foreground bg-card
            shadow-sm transition-[border-color,box-shadow] duration-150
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-muted disabled:cursor-not-allowed
            ${
              hasError
                ? "border-destructive focus:ring-destructive focus:border-destructive"
                : "border-border focus:ring-primary focus:border-primary"
            }
            ${className}
          `}
          aria-invalid={hasError}
          aria-describedby={[errorId, helperId].filter(Boolean).join(" ") || undefined}
          {...props}
        />
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

Input.displayName = "Input";

import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { Button as ShadcnButton } from "@/components/ui/shadcn/button";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
  children: ReactNode;
}

const variantMap: Record<
  ButtonVariant,
  "default" | "secondary" | "destructive" | "ghost" | "outline" | "link"
> = {
  primary: "default",
  secondary: "secondary",
  danger: "destructive",
  ghost: "ghost",
};

const sizeMap: Record<ButtonSize, "default" | "sm" | "lg" | "icon"> = {
  sm: "sm",
  md: "default",
  lg: "lg",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  asChild,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <ShadcnButton
      variant={variantMap[variant]}
      size={sizeMap[size]}
      disabled={isDisabled}
      asChild={asChild}
      aria-busy={loading}
      aria-disabled={isDisabled}
      className={cn(className)}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </ShadcnButton>
  );
}

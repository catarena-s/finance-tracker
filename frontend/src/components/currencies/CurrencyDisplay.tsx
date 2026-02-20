"use client";

import React from "react";
import { formatCurrency } from "@/utils/format";

interface CurrencyDisplayProps {
  amount: number;
  currency: string;
  convertedAmount?: number;
  convertedCurrency?: string;
  className?: string;
}

export function CurrencyDisplay({
  amount,
  currency,
  convertedAmount,
  convertedCurrency,
  className = "",
}: CurrencyDisplayProps) {
  return (
    <span className={className}>
      {formatCurrency(amount, currency)}
      {convertedAmount != null && convertedCurrency && (
        <span className="text-gray-500 text-sm ml-1">
          ≈ {formatCurrency(convertedAmount, convertedCurrency)}
        </span>
      )}
    </span>
  );
}

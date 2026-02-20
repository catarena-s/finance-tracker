"use client";

import React from "react";
import type { Currency } from "@/types/api";

interface CurrencySelectorProps {
  currencies: Currency[];
  value: string;
  onChange: (code: string) => void;
  label?: string;
  className?: string;
}

export function CurrencySelector({
  currencies,
  value,
  onChange,
  label = "Валюта",
  className = "",
}: CurrencySelectorProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <select
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {currencies.filter((c) => c.isActive).map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} — {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

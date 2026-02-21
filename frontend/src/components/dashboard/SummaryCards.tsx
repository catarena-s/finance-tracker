import React from "react";
import { formatCurrency } from "@/utils/format";
import type { SummaryByCurrency } from "@/types/api";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  displayCurrency?: string;
  byCurrency?: SummaryByCurrency[];
  currencyRates?: Record<string, number>;
  loading?: boolean;
}

export function SummaryCards({
  totalIncome,
  totalExpense,
  balance,
  displayCurrency = "RUB",
  byCurrency,
  currencyRates,
  loading = false,
}: SummaryCardsProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: displayCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 animate-pulse"
            role="status"
            aria-label="Loading"
          >
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Доходы</p>
              <p className="text-3xl font-bold text-green-600">
                {formatAmount(totalIncome)}
              </p>
              {byCurrency && byCurrency.length > 1 && (
                <div className="mt-2 space-y-1">
                  {byCurrency.map((item) => (
                    <p key={item.currency} className="text-xs text-gray-500">
                      {item.currency}: {new Intl.NumberFormat("ru-RU", {
                        style: "currency",
                        currency: item.currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(parseFloat(item.totalIncome.toString()))}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Расходы</p>
              <p className="text-3xl font-bold text-red-600">
                {formatAmount(totalExpense)}
              </p>
              {byCurrency && byCurrency.length > 1 && (
                <div className="mt-2 space-y-1">
                  {byCurrency.map((item) => (
                    <p key={item.currency} className="text-xs text-gray-500">
                      {item.currency}: {new Intl.NumberFormat("ru-RU", {
                        style: "currency",
                        currency: item.currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(parseFloat(item.totalExpense.toString()))}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Баланс</p>
              <p
                className={`text-3xl font-bold ${
                  balance >= 0 ? "text-blue-600" : "text-red-600"
                }`}
              >
                {formatAmount(balance)}
              </p>
              {byCurrency && byCurrency.length > 1 && (
                <div className="mt-2 space-y-1">
                  {byCurrency.map((item) => (
                    <p key={item.currency} className="text-xs text-gray-500">
                      {item.currency}: {new Intl.NumberFormat("ru-RU", {
                        style: "currency",
                        currency: item.currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(parseFloat(item.balance.toString()))}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Курсы валют */}
      {currencyRates && byCurrency && byCurrency.length > 1 && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <svg className="w-4 h-4 text-blue-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Курсы валют к RUB:</span>
            {Object.entries(currencyRates)
              .filter(([currency]) => currency !== 'RUB' && byCurrency.some(bc => bc.currency === currency))
              .map(([currency, rate]) => (
                <span key={currency} className="text-gray-600">
                  {currency} = ₽{rate.toFixed(2)}
                </span>
              ))
              .reduce((prev, curr, i) => [prev, <span key={`sep-${i}`} className="text-gray-400">•</span>, curr] as any)
            }
          </div>
        </div>
      )}
    </>
  );
}

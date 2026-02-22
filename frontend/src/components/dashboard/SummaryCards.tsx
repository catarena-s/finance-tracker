import React from "react";
import { formatCurrency } from "@/utils/format";
import type { SummaryByCurrency } from "@/types/api";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Skeleton } from "@/components/ui/Skeleton";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

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
          <Card key={index}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-9 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Доходы</p>
                <p className="text-3xl font-semibold text-secondary">
                  {formatAmount(totalIncome)}
                </p>
                {byCurrency && byCurrency.length > 1 && (
                  <div className="mt-2 space-y-1">
                    {byCurrency.map((item) => (
                      <p key={item.currency} className="text-xs text-muted-foreground">
                        {item.currency}:{" "}
                        {new Intl.NumberFormat("ru-RU", {
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
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Расходы</p>
                <p className="text-3xl font-semibold text-destructive">
                  {formatAmount(totalExpense)}
                </p>
                {byCurrency && byCurrency.length > 1 && (
                  <div className="mt-2 space-y-1">
                    {byCurrency.map((item) => (
                      <p key={item.currency} className="text-xs text-muted-foreground">
                        {item.currency}:{" "}
                        {new Intl.NumberFormat("ru-RU", {
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
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Баланс</p>
                <p
                  className={`text-3xl font-semibold ${
                    balance >= 0 ? "text-primary" : "text-destructive"
                  }`}
                >
                  {formatAmount(balance)}
                </p>
                {byCurrency && byCurrency.length > 1 && (
                  <div className="mt-2 space-y-1">
                    {byCurrency.map((item) => (
                      <p key={item.currency} className="text-xs text-muted-foreground">
                        {item.currency}:{" "}
                        {new Intl.NumberFormat("ru-RU", {
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
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {currencyRates && byCurrency && byCurrency.length > 1 && (
        <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-foreground">
            <span className="font-medium">Курсы валют к RUB:</span>
            {Object.entries(currencyRates)
              .filter(
                ([currency]) =>
                  currency !== "RUB" &&
                  byCurrency.some((bc) => bc.currency === currency)
              )
              .map(([currency, rate], index) => (
                <React.Fragment key={currency}>
                  {index > 0 && (
                    <span className="text-muted-foreground/50"> • </span>
                  )}
                  <span className="text-muted-foreground">
                    {currency} = ₽{rate.toFixed(2)}
                  </span>
                </React.Fragment>
              ))}
          </div>
        </div>
      )}
    </>
  );
}

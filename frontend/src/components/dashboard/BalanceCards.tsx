import React from "react";
import { formatCurrency } from "@/utils/format";
import type { SummaryByCurrency } from "@/types/api";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Skeleton } from "@/components/ui/Skeleton";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface BalanceCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  displayCurrency?: string;
  byCurrency?: SummaryByCurrency[];
  currencyRates?: Record<string, number>;
  loading?: boolean;
}

export function BalanceCards({
  totalIncome,
  totalExpense,
  balance,
  displayCurrency = "RUB",
  byCurrency,
  currencyRates,
  loading = false,
}: BalanceCardsProps) {
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
      <div
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
        role="status"
        aria-label="Загрузка"
      >
        {[...Array(3)].map((_, index) => (
          <Card
            key={index}
            className="rounded-2xl border border-border bg-card shadow-sm"
          >
            <CardContent className="p-6 md:p-8">
              <Skeleton className="mb-4 h-4 w-24" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md md:p-8">
          <CardContent className="p-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Доходы</p>
                <p className="mt-1 text-3xl font-semibold text-foreground md:text-4xl">
                  {formatAmount(totalIncome)}
                </p>
                {byCurrency && byCurrency.length > 1 && (
                  <div className="mt-3 space-y-1">
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
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/10">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md md:p-8">
          <CardContent className="p-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Расходы</p>
                <p className="mt-1 text-3xl font-semibold text-foreground md:text-4xl">
                  {formatAmount(totalExpense)}
                </p>
                {byCurrency && byCurrency.length > 1 && (
                  <div className="mt-3 space-y-1">
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
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted">
                <TrendingDown className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md md:p-8">
          <CardContent className="p-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Баланс</p>
                <p
                  className={`mt-1 text-3xl font-semibold md:text-4xl ${
                    balance >= 0 ? "text-primary" : "text-destructive"
                  }`}
                >
                  {formatAmount(balance)}
                </p>
                {byCurrency && byCurrency.length > 1 && (
                  <div className="mt-3 space-y-1">
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
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {currencyRates && byCurrency && byCurrency.length > 1 && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
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
                  {index > 0 && <span className="text-muted-foreground/60"> • </span>}
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

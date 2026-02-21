/**
 * Unit tests — SummaryCards
 * Рендер сводки, блок «По валютам» (byCurrency).
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { SummaryCards } from "@/components/dashboard/SummaryCards";

describe("SummaryCards", () => {
  it("renders total income, expense and balance", () => {
    render(
      <SummaryCards
        totalIncome={1000}
        totalExpense={300}
        balance={700}
      />
    );
    expect(screen.getByText("Доходы")).toBeInTheDocument();
    expect(screen.getByText("Расходы")).toBeInTheDocument();
    expect(screen.getByText("Баланс")).toBeInTheDocument();
  });

  it("renders byCurrency section when byCurrency is provided", () => {
    render(
      <SummaryCards
        totalIncome={1000}
        totalExpense={300}
        balance={700}
        byCurrency={[
          { currency: "USD", totalIncome: 500, totalExpense: 200, balance: 300 },
          { currency: "EUR", totalIncome: 500, totalExpense: 100, balance: 400 },
        ]}
      />
    );
    expect(screen.getByText("По валютам")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("EUR")).toBeInTheDocument();
  });

  it("does not render byCurrency section when byCurrency is empty", () => {
    render(
      <SummaryCards
        totalIncome={1000}
        totalExpense={300}
        balance={700}
        byCurrency={[]}
      />
    );
    expect(screen.queryByText("По валютам")).not.toBeInTheDocument();
  });

  it("shows loading state when loading is true", () => {
    const { container } = render(
      <SummaryCards
        totalIncome={0}
        totalExpense={0}
        balance={0}
        loading
      />
    );
    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
  });
});

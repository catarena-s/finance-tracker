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

  it("renders byCurrency breakdown when multiple currencies are provided", () => {
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
    // Проверяем что валюты отображаются в карточках
    const usdElements = screen.getAllByText(/USD/);
    const eurElements = screen.getAllByText(/EUR/);
    expect(usdElements.length).toBeGreaterThan(0);
    expect(eurElements.length).toBeGreaterThan(0);
  });

  it("does not render byCurrency breakdown when only one currency", () => {
    render(
      <SummaryCards
        totalIncome={1000}
        totalExpense={300}
        balance={700}
        byCurrency={[
          { currency: "RUB", totalIncome: 1000, totalExpense: 300, balance: 700 },
        ]}
      />
    );
    // Когда только одна валюта, разбивка не отображается
    expect(screen.queryByText(/RUB:/)).not.toBeInTheDocument();
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

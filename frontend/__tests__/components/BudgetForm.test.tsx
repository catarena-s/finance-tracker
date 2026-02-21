/**
 * Unit tests — BudgetForm
 * Рендер формы, наличие поля «Валюта».
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { BudgetForm } from "@/components/budgets/BudgetForm";

const mockCategories = [
  {
    id: "cat-1",
    name: "Продукты",
    type: "expense" as const,
    color: "#00FF00",
    createdAt: "",
    updatedAt: "",
  },
];

describe("BudgetForm", () => {
  it("renders currency select", () => {
    render(
      <BudgetForm
        categories={mockCategories}
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByLabelText(/Валюта/)).toBeInTheDocument();
  });

  it("renders category and period selects", () => {
    render(
      <BudgetForm
        categories={mockCategories}
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByText("Категория")).toBeInTheDocument();
    expect(screen.getByText("Период")).toBeInTheDocument();
  });

  it("when editing budget, shows budget currency", () => {
    render(
      <BudgetForm
        budget={{
          id: "b-1",
          categoryId: "cat-1",
          amount: 5000,
          currency: "RUB",
          period: "monthly",
          startDate: "2025-01-01",
          endDate: "2025-01-31",
          createdAt: "",
          updatedAt: "",
        }}
        categories={mockCategories}
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    const currencySelect = screen.getByLabelText(/Валюта/);
    expect(currencySelect).toHaveValue("RUB");
  });
});

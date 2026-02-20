/**
 * Unit tests — CSVPreview
 * Рендер таблицы по строкам и маппингу колонок.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { CSVPreview } from "@/components/csv/CSVPreview";

const rows = [
  { amount: "100", date: "2024-01-01", type: "expense", category: "Food" },
  { amount: "50", date: "2024-01-02", type: "income", category: "Salary" },
];
const mapping = {
  amount: "amount",
  transactionDate: "date",
  type: "type",
  categoryName: "category",
};

describe("CSVPreview", () => {
  it("renders header and data rows", () => {
    render(<CSVPreview rows={rows} mapping={mapping} />);
    expect(screen.getByText("amount")).toBeInTheDocument();
    expect(screen.getByText("date")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Salary")).toBeInTheDocument();
  });

  it("shows message when no rows", () => {
    render(<CSVPreview rows={[]} mapping={mapping} />);
    expect(screen.getByText(/Нет данных для предпросмотра/)).toBeInTheDocument();
  });

  it("limits rows to maxRows", () => {
    const manyRows = Array.from({ length: 15 }, (_, i) => ({
      amount: String(i),
      date: "2024-01-01",
      type: "expense",
      category: "Cat",
    }));
    render(<CSVPreview rows={manyRows} mapping={mapping} maxRows={5} />);
    expect(screen.getByText(/Показаны первые 5 из 15/)).toBeInTheDocument();
  });
});

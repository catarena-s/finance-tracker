/**
 * Unit tests — CurrencySelector
 * Рендер списка валют и вызов onChange.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CurrencySelector } from "@/components/currencies/CurrencySelector";

const mockCurrencies = [
  { code: "USD", name: "US Dollar", symbol: "$", isActive: true, createdAt: "" },
  { code: "EUR", name: "Euro", symbol: "€", isActive: true, createdAt: "" },
  { code: "X", name: "Inactive", symbol: "x", isActive: false, createdAt: "" },
];

describe("CurrencySelector", () => {
  it("renders label and options", () => {
    const onChange = jest.fn();
    render(
      <CurrencySelector
        currencies={mockCurrencies}
        value="USD"
        onChange={onChange}
      />
    );
    expect(screen.getByText("Валюта")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /USD — US Dollar/ })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /EUR — Euro/ })).toBeInTheDocument();
    expect(screen.queryByText(/Inactive/)).not.toBeInTheDocument();
  });

  it("calls onChange when selection changes", async () => {
    const onChange = jest.fn();
    render(
      <CurrencySelector
        currencies={mockCurrencies}
        value="USD"
        onChange={onChange}
      />
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "EUR");
    expect(onChange).toHaveBeenCalledWith("EUR");
  });
});

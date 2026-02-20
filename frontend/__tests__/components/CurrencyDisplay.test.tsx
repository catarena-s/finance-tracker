/**
 * Unit tests — CurrencyDisplay
 * Рендер суммы и конвертированной суммы.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { CurrencyDisplay } from "@/components/currencies/CurrencyDisplay";

describe("CurrencyDisplay", () => {
  it("renders amount and currency", () => {
    render(<CurrencyDisplay amount={100} currency="USD" />);
    expect(screen.getByText(/100\.00/)).toBeInTheDocument();
  });

  it("renders converted amount when provided", () => {
    render(
      <CurrencyDisplay
        amount={100}
        currency="USD"
        convertedAmount={85}
        convertedCurrency="EUR"
      />
    );
    expect(screen.getByText(/100\.00/)).toBeInTheDocument();
    expect(screen.getByText(/85\.00/)).toBeInTheDocument();
    expect(screen.getByText(/≈/)).toBeInTheDocument();
  });

  it("does not render converted block when convertedCurrency is missing", () => {
    render(
      <CurrencyDisplay amount={50} currency="RUB" convertedAmount={0.5} />
    );
    expect(screen.getByText(/50/)).toBeInTheDocument();
    expect(screen.queryByText(/0\.5/)).not.toBeInTheDocument();
  });
});

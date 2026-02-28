/**
 * Unit tests — BalanceCards
 * Тестирование адаптивного поведения карточек баланса
 * Требования: 1.1, 1.3
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { BalanceCards } from "@/components/dashboard/BalanceCards";
import type { SummaryByCurrency } from "@/types/api";

describe("BalanceCards", () => {
  const defaultProps = {
    totalIncome: 50000,
    totalExpense: 30000,
    balance: 20000,
    displayCurrency: "RUB" as const,
  };

  describe("responsive layout", () => {
    it("should display cards in three columns on all viewports for compactness", () => {
      const { container } = render(<BalanceCards {...defaultProps} />);
      
      // Проверяем наличие grid контейнера с классом для трех колонок
      const gridContainer = container.querySelector(".grid");
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass("grid-cols-3");
      
      // Проверяем, что все три карточки отображаются
      expect(screen.getByText("Доходы")).toBeInTheDocument();
      expect(screen.getByText("Расходы")).toBeInTheDocument();
      expect(screen.getByText("Баланс")).toBeInTheDocument();
    });

    it("should have responsive gap between cards", () => {
      const { container } = render(<BalanceCards {...defaultProps} />);
      
      const gridContainer = container.querySelector(".grid");
      expect(gridContainer).toHaveClass("gap-2");
      expect(gridContainer).toHaveClass("sm:gap-4");
      expect(gridContainer).toHaveClass("md:gap-6");
    });
  });

  describe("currency data handling", () => {
    it("should handle empty currency data gracefully", () => {
      const propsWithEmptyCurrency = {
        ...defaultProps,
        byCurrency: [] as SummaryByCurrency[],
        currencyRates: {},
      };

      const { container } = render(<BalanceCards {...propsWithEmptyCurrency} />);
      
      // Проверяем, что основные карточки отображаются
      expect(screen.getByText("Доходы")).toBeInTheDocument();
      expect(screen.getByText("Расходы")).toBeInTheDocument();
      expect(screen.getByText("Баланс")).toBeInTheDocument();
      
      // Проверяем, что информация о валютах не отображается
      expect(screen.queryByText(/USD:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/EUR:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Курсы валют/)).not.toBeInTheDocument();
    });

    it("should not display currency breakdown when byCurrency is undefined", () => {
      render(<BalanceCards {...defaultProps} />);
      
      // Проверяем, что основные карточки отображаются
      expect(screen.getByText("Доходы")).toBeInTheDocument();
      expect(screen.getByText("Расходы")).toBeInTheDocument();
      expect(screen.getByText("Баланс")).toBeInTheDocument();
      
      // Проверяем, что информация о валютах не отображается
      expect(screen.queryByText(/USD:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/EUR:/)).not.toBeInTheDocument();
    });

    it("should not display currency breakdown when only one currency", () => {
      const propsWithSingleCurrency = {
        ...defaultProps,
        byCurrency: [
          {
            currency: "RUB",
            totalIncome: 50000,
            totalExpense: 30000,
            balance: 20000,
          },
        ] as SummaryByCurrency[],
      };

      render(<BalanceCards {...propsWithSingleCurrency} />);
      
      // Проверяем, что основные карточки отображаются
      expect(screen.getByText("Доходы")).toBeInTheDocument();
      
      // Когда только одна валюта, разбивка по валютам не отображается в карточках
      const rubBreakdown = screen.queryByText(/RUB:/);
      expect(rubBreakdown).not.toBeInTheDocument();
    });

    it("should display currency breakdown when multiple currencies are provided", () => {
      const propsWithMultipleCurrencies = {
        ...defaultProps,
        byCurrency: [
          {
            currency: "USD",
            totalIncome: 1000,
            totalExpense: 500,
            balance: 500,
          },
          {
            currency: "EUR",
            totalIncome: 800,
            totalExpense: 300,
            balance: 500,
          },
        ] as SummaryByCurrency[],
        currencyRates: {
          USD: 75.5,
          EUR: 85.2,
        },
      };

      render(<BalanceCards {...propsWithMultipleCurrencies} />);
      
      // Проверяем, что валюты отображаются в карточках
      const usdElements = screen.getAllByText(/USD/);
      const eurElements = screen.getAllByText(/EUR/);
      expect(usdElements.length).toBeGreaterThan(0);
      expect(eurElements.length).toBeGreaterThan(0);
      
      // Проверяем, что отображается блок с курсами валют
      expect(screen.getByText(/Курсы валют к RUB:/)).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("should show loading skeletons when loading is true", () => {
      const { container } = render(
        <BalanceCards {...defaultProps} loading={true} />
      );
      
      // Проверяем наличие индикатора загрузки
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
      expect(screen.getByLabelText("Загрузка")).toBeInTheDocument();
      
      // Проверяем, что реальные данные не отображаются
      expect(screen.queryByText("Доходы")).not.toBeInTheDocument();
      expect(screen.queryByText("Расходы")).not.toBeInTheDocument();
      expect(screen.queryByText("Баланс")).not.toBeInTheDocument();
    });
  });

  describe("content rendering", () => {
    it("should render all three balance cards with correct labels", () => {
      render(<BalanceCards {...defaultProps} />);
      
      expect(screen.getByText("Доходы")).toBeInTheDocument();
      expect(screen.getByText("Расходы")).toBeInTheDocument();
      expect(screen.getByText("Баланс")).toBeInTheDocument();
    });

    it("should format amounts correctly", () => {
      render(<BalanceCards {...defaultProps} />);
      
      // Проверяем, что суммы отформатированы (содержат символ рубля или числа)
      expect(screen.getByText(/50.*000/)).toBeInTheDocument(); // Доходы
      expect(screen.getByText(/30.*000/)).toBeInTheDocument(); // Расходы
      expect(screen.getByText(/20.*000/)).toBeInTheDocument(); // Баланс
    });

    it("should apply correct color to positive balance", () => {
      const { container } = render(<BalanceCards {...defaultProps} balance={20000} />);
      
      // Находим элемент с балансом и проверяем класс для положительного баланса
      const balanceElements = container.querySelectorAll(".text-primary");
      expect(balanceElements.length).toBeGreaterThan(0);
    });

    it("should apply correct color to negative balance", () => {
      const { container } = render(<BalanceCards {...defaultProps} balance={-5000} />);
      
      // Находим элемент с балансом и проверяем класс для отрицательного баланса
      const balanceElements = container.querySelectorAll(".text-destructive");
      expect(balanceElements.length).toBeGreaterThan(0);
    });
  });

  describe("responsive padding and spacing", () => {
    it("should have responsive padding classes on cards", () => {
      const { container } = render(<BalanceCards {...defaultProps} />);
      
      // Проверяем наличие адаптивных классов padding
      const cards = container.querySelectorAll(".p-2");
      expect(cards.length).toBeGreaterThan(0);
      
      // Проверяем наличие классов для больших экранов
      const cardsWithSmPadding = container.querySelectorAll(".sm\\:p-3");
      expect(cardsWithSmPadding.length).toBeGreaterThan(0);
      
      const cardsWithMdPadding = container.querySelectorAll(".md\\:p-4");
      expect(cardsWithMdPadding.length).toBeGreaterThan(0);
    });
  });

  describe("icon rendering", () => {
    it("should render icons with responsive sizes", () => {
      const { container } = render(<BalanceCards {...defaultProps} />);
      
      // Проверяем наличие иконок с адаптивными размерами
      const icons = container.querySelectorAll(".h-6, .sm\\:h-8, .md\\:h-10");
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});

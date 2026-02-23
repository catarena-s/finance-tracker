import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { Category } from "@/types/api";

const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Зарплата",
    icon: "💰",
    type: "income",
    color: "#00B894",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "cat-2",
    name: "Продукты",
    icon: "🛒",
    type: "expense",
    color: "#FF6B6B",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "cat-3",
    name: "Транспорт",
    icon: "🚗",
    type: "expense",
    color: "#4ECDC4",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

describe("TransactionFilters", () => {
  it("filters categories by selected type", async () => {
    const onFilterChange = jest.fn();
    const { container } = render(
      <TransactionFilters categories={mockCategories} onFilterChange={onFilterChange} />
    );

    // Находим все селекты
    const selects = container.querySelectorAll("select");
    const typeSelect = selects[0] as HTMLSelectElement;
    const categorySelect = selects[1] as HTMLSelectElement;

    // Меняем тип на "expense"
    fireEvent.change(typeSelect, { target: { value: "expense" } });

    await waitFor(() => {
      // Проверяем, что onFilterChange был вызван с правильными параметрами
      const lastCall = onFilterChange.mock.calls[onFilterChange.mock.calls.length - 1][0];
      expect(lastCall.type).toBe("expense");
    });

    // Проверяем, что в селекте категорий только expense категории
    const options = Array.from(categorySelect.options).map((opt) => opt.text);
    
    // Должны быть: "Все категории", "🛒 Продукты", "🚗 Транспорт"
    expect(options).toContain("Все категории");
    expect(options).toContain("🛒 Продукты");
    expect(options).toContain("🚗 Транспорт");
    expect(options).not.toContain("💰 Зарплата");
  });

  it("sets type automatically when category is selected", async () => {
    const onFilterChange = jest.fn();
    const { container } = render(
      <TransactionFilters categories={mockCategories} onFilterChange={onFilterChange} />
    );

    // Находим селект категории
    const categorySelect = container.querySelectorAll("select")[1] as HTMLSelectElement;

    // Выбираем категорию "Продукты" (expense)
    fireEvent.change(categorySelect, { target: { value: "cat-2" } });

    await waitFor(() => {
      const lastCall = onFilterChange.mock.calls[onFilterChange.mock.calls.length - 1][0];
      expect(lastCall.categoryId).toBe("cat-2");
      expect(lastCall.type).toBe("expense");
    });
  });

  it("clears incompatible category when type changes", async () => {
    const onFilterChange = jest.fn();
    const { container } = render(
      <TransactionFilters categories={mockCategories} onFilterChange={onFilterChange} />
    );

    const selects = container.querySelectorAll("select");
    const typeSelect = selects[0] as HTMLSelectElement;
    const categorySelect = selects[1] as HTMLSelectElement;

    // Выбираем категорию "Продукты" (expense)
    fireEvent.change(categorySelect, { target: { value: "cat-2" } });

    await waitFor(() => {
      const lastCall = onFilterChange.mock.calls[onFilterChange.mock.calls.length - 1][0];
      expect(lastCall.categoryId).toBe("cat-2");
      expect(lastCall.type).toBe("expense");
    });

    // Меняем тип на "income"
    fireEvent.change(typeSelect, { target: { value: "income" } });

    await waitFor(() => {
      const lastCall = onFilterChange.mock.calls[onFilterChange.mock.calls.length - 1][0];
      expect(lastCall.type).toBe("income");
      expect(lastCall.categoryId).toBeUndefined(); // Категория не должна передаваться
    });
  });

  it("does not send empty type to backend", async () => {
    const onFilterChange = jest.fn();
    const { container } = render(
      <TransactionFilters categories={mockCategories} onFilterChange={onFilterChange} />
    );

    // Находим селект типа
    const selects = container.querySelectorAll("select");
    const typeSelect = selects[0] as HTMLSelectElement;

    // Меняем тип на пустое значение (если было что-то выбрано)
    fireEvent.change(typeSelect, { target: { value: "" } });

    await waitFor(() => {
      if (onFilterChange.mock.calls.length > 0) {
        const lastCall = onFilterChange.mock.calls[onFilterChange.mock.calls.length - 1][0];
        // Проверяем что type не передается если пустая строка
        expect(lastCall.type).toBeUndefined();
      }
    });
  });

  it("sends type filter to backend when selected", async () => {
    const onFilterChange = jest.fn();
    const { container } = render(
      <TransactionFilters categories={mockCategories} onFilterChange={onFilterChange} />
    );

    const selects = container.querySelectorAll("select");
    const typeSelect = selects[0] as HTMLSelectElement;
    
    fireEvent.change(typeSelect, { target: { value: "income" } });

    await waitFor(() => {
      const lastCall = onFilterChange.mock.calls[onFilterChange.mock.calls.length - 1][0];
      expect(lastCall.type).toBe("income");
    });
  });
});

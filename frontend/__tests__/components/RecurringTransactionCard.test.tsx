/**
 * Unit tests — RecurringTransactionCard
 * Рендер карточки и вызовы onEdit, onDelete, onToggleActive.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecurringTransactionCard } from "@/components/recurring/RecurringTransactionCard";

const mockItem = {
  id: "rec-1",
  name: "Подписка",
  amount: 10,
  currency: "USD",
  categoryId: "cat-1",
  type: "expense" as const,
  frequency: "monthly" as const,
  interval: 1,
  startDate: "2024-01-01",
  nextOccurrence: "2024-02-01",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("RecurringTransactionCard", () => {
  it("renders name, amount and frequency", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const onToggle = jest.fn();
    render(
      <RecurringTransactionCard
        item={mockItem}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggle}
      />
    );
    expect(screen.getByText("Подписка")).toBeInTheDocument();
    expect(screen.getByText(/Ежемесячно/)).toBeInTheDocument();
    expect(screen.getByText(/Расход/)).toBeInTheDocument();
    expect(screen.getByText(/Активен/)).toBeInTheDocument();
  });

  it("calls onToggleActive when toggle button clicked", async () => {
    const onToggle = jest.fn();
    render(
      <RecurringTransactionCard
        item={mockItem}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onToggleActive={onToggle}
      />
    );
    await userEvent.click(screen.getByText("Отключить"));
    expect(onToggle).toHaveBeenCalledWith("rec-1", false);
  });

  it("calls onEdit when edit button clicked", async () => {
    const onEdit = jest.fn();
    render(
      <RecurringTransactionCard
        item={mockItem}
        onEdit={onEdit}
        onDelete={jest.fn()}
        onToggleActive={jest.fn()}
      />
    );
    await userEvent.click(screen.getByText("Изменить"));
    expect(onEdit).toHaveBeenCalledWith(mockItem);
  });

  it("calls onDelete when delete button clicked", async () => {
    const onDelete = jest.fn();
    render(
      <RecurringTransactionCard
        item={mockItem}
        onEdit={jest.fn()}
        onDelete={onDelete}
        onToggleActive={jest.fn()}
      />
    );
    await userEvent.click(screen.getByText("Удалить"));
    expect(onDelete).toHaveBeenCalledWith("rec-1");
  });
});

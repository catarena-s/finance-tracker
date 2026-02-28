/**
 * Unit tests — CategoryCard
 * Тестирование отображения кнопок действий на карточках категорий
 * Требования: 5.3
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { CategoryCard } from "@/components/categories/CategoryCard";
import type { Category } from "@/types/api";

describe("CategoryCard", () => {
  const mockCategory: Category = {
    id: "1",
    name: "Продукты",
    type: "expense",
    icon: "ShoppingCart",
    color: "#10b981",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("action buttons visibility", () => {
    it("should have action buttons always visible on mobile devices", () => {
      // Устанавливаем мобильный viewport (< 640px)
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(
        <CategoryCard
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Находим контейнер с кнопками действий
      const actionButtonsContainer = container.querySelector(
        ".opacity-100"
      );
      expect(actionButtonsContainer).toBeInTheDocument();

      // Проверяем, что кнопки редактирования и удаления присутствуют
      const editButton = screen.getByLabelText("Редактировать");
      const deleteButton = screen.getByLabelText("Удалить");

      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();

      // Проверяем, что контейнер имеет класс opacity-100 (всегда видимый)
      expect(actionButtonsContainer).toHaveClass("opacity-100");
    });

    it("should have action buttons hidden by default on desktop (visible on hover)", () => {
      // Устанавливаем desktop viewport (>= 640px)
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { container } = render(
        <CategoryCard
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Находим контейнер с кнопками действий
      const actionButtonsContainer = container.querySelector(
        ".sm\\:opacity-0"
      );
      expect(actionButtonsContainer).toBeInTheDocument();

      // Проверяем, что контейнер имеет класс sm:opacity-0 (скрыт по умолчанию на desktop)
      expect(actionButtonsContainer).toHaveClass("sm:opacity-0");

      // Проверяем, что контейнер имеет класс sm:group-hover:opacity-100 (виден при hover)
      expect(actionButtonsContainer).toHaveClass("sm:group-hover:opacity-100");
    });

    it("should render both edit and delete buttons", () => {
      render(
        <CategoryCard
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Проверяем наличие обеих кнопок
      const editButton = screen.getByLabelText("Редактировать");
      const deleteButton = screen.getByLabelText("Удалить");

      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
    });

    it("should have appropriate button sizes on mobile (36x36px minimum)", () => {
      // Устанавливаем мобильный viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(
        <CategoryCard
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Проверяем, что кнопки имеют класс h-9 w-9 (36x36px на мобильных)
      const buttons = container.querySelectorAll(".h-9.w-9");
      expect(buttons.length).toBe(2); // Две кнопки: редактировать и удалить
    });

    it("should have appropriate button sizes on desktop (32x32px)", () => {
      // Устанавливаем desktop viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { container } = render(
        <CategoryCard
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Проверяем, что кнопки имеют класс sm:h-8 sm:w-8 (32x32px на desktop)
      const buttons = container.querySelectorAll(".sm\\:h-8.sm\\:w-8");
      expect(buttons.length).toBe(2); // Две кнопки: редактировать и удалить
    });
  });

  describe("category information display", () => {
    it("should display category name", () => {
      render(
        <CategoryCard
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText("Продукты")).toBeInTheDocument();
    });

    it("should display category type badge for expense", () => {
      render(
        <CategoryCard
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText("Расход")).toBeInTheDocument();
    });

    it("should display category type badge for income", () => {
      const incomeCategory: Category = {
        ...mockCategory,
        type: "income",
      };

      render(
        <CategoryCard
          category={incomeCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText("Доход")).toBeInTheDocument();
    });

    it("should truncate long category names", () => {
      const longNameCategory: Category = {
        ...mockCategory,
        name: "Очень длинное название категории которое должно быть обрезано",
      };

      const { container } = render(
        <CategoryCard
          category={longNameCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Проверяем, что название имеет класс truncate
      const nameElement = container.querySelector(".truncate");
      expect(nameElement).toBeInTheDocument();
      expect(nameElement).toHaveTextContent(longNameCategory.name);
    });
  });

  describe("icon and color display", () => {
    it("should display category icon with correct color", () => {
      const { container } = render(
        <CategoryCard
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Проверяем наличие иконки
      const iconContainer = container.querySelector('[aria-label="Иконка категории"]');
      expect(iconContainer).toBeInTheDocument();

      // Проверяем, что иконка имеет правильный цвет фона
      expect(iconContainer).toHaveStyle({
        backgroundColor: `${mockCategory.color}20`,
      });
    });

    it("should display color indicator", () => {
      const { container } = render(
        <CategoryCard
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Проверяем наличие цветового индикатора
      const colorIndicator = container.querySelector(
        `[aria-label="Цвет категории: ${mockCategory.color}"]`
      );
      expect(colorIndicator).toBeInTheDocument();
      expect(colorIndicator).toHaveStyle({
        backgroundColor: mockCategory.color,
      });
    });

    it("should maintain icon proportions (square aspect ratio)", () => {
      const { container } = render(
        <CategoryCard
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Проверяем, что контейнер иконки имеет одинаковые высоту и ширину
      const iconContainer = container.querySelector(".h-11.w-11");
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("should call onEdit when edit button is clicked", () => {
      render(
        <CategoryCard
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText("Редактировать");
      editButton.click();

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledWith(mockCategory);
    });

    it("should call onDelete when delete button is clicked", () => {
      render(
        <CategoryCard
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByLabelText("Удалить");
      deleteButton.click();

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith(mockCategory.id);
    });
  });

  describe("hover effects", () => {
    it("should have group class for hover effects", () => {
      const { container } = render(
        <CategoryCard
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Проверяем, что карточка имеет класс group для hover эффектов
      const card = container.querySelector(".group");
      expect(card).toBeInTheDocument();
    });

    it("should have transition classes for smooth animations", () => {
      const { container } = render(
        <CategoryCard
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Проверяем наличие transition классов
      const actionButtonsContainer = container.querySelector(".transition-opacity");
      expect(actionButtonsContainer).toBeInTheDocument();
    });
  });
});

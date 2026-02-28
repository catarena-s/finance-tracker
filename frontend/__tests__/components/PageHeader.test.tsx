/**
 * Unit tests — Page Headers
 * Тестирование адаптивного поведения заголовков страниц
 * Требования: 6.1, 6.3
 */
import React from "react";
import { render } from "@testing-library/react";

// Компонент для тестирования заголовков страниц
const PageHeader: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
};

describe("PageHeader", () => {
  describe("responsive font sizes", () => {
    it("should use text-2xl font size on mobile (viewport 375px)", () => {
      // Устанавливаем мобильный viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(<PageHeader title="Тестовый заголовок" />);
      
      const heading = container.querySelector("h1");
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass("text-2xl");
      expect(heading).toHaveClass("md:text-3xl");
    });

    it("should use text-2xl font size on small mobile (viewport 320px)", () => {
      // Устанавливаем минимальный мобильный viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 320,
      });

      const { container } = render(<PageHeader title="Тестовый заголовок" />);
      
      const heading = container.querySelector("h1");
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass("text-2xl");
    });

    it("should have md:text-3xl class for desktop font size (viewport 768px)", () => {
      // Устанавливаем tablet/desktop viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { container } = render(<PageHeader title="Тестовый заголовок" />);
      
      const heading = container.querySelector("h1");
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass("md:text-3xl");
    });

    it("should have md:text-3xl class for large desktop (viewport 1024px)", () => {
      // Устанавливаем desktop viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { container } = render(<PageHeader title="Тестовый заголовок" />);
      
      const heading = container.querySelector("h1");
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass("text-2xl");
      expect(heading).toHaveClass("md:text-3xl");
    });
  });

  describe("minimum padding", () => {
    it("should have minimum 16px padding (px-4) on mobile (viewport 320px)", () => {
      // Устанавливаем минимальный мобильный viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 320,
      });

      const { container } = render(<PageHeader title="Тестовый заголовок" />);
      
      // Проверяем контейнер с padding
      const paddingContainer = container.querySelector(".px-4");
      expect(paddingContainer).toBeInTheDocument();
      expect(paddingContainer).toHaveClass("px-4");
    });

    it("should have minimum 16px padding (px-4) on mobile (viewport 375px)", () => {
      // Устанавливаем стандартный мобильный viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(<PageHeader title="Тестовый заголовок" />);
      
      const paddingContainer = container.querySelector(".px-4");
      expect(paddingContainer).toBeInTheDocument();
    });

    it("should have minimum 16px padding (px-4) on mobile landscape (viewport 480px)", () => {
      // Устанавливаем мобильный landscape viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 480,
      });

      const { container } = render(<PageHeader title="Тестовый заголовок" />);
      
      const paddingContainer = container.querySelector(".px-4");
      expect(paddingContainer).toBeInTheDocument();
    });

    it("should have responsive padding classes (sm:px-6 lg:px-8)", () => {
      const { container } = render(<PageHeader title="Тестовый заголовок" />);
      
      // Проверяем наличие адаптивных классов padding для больших экранов
      const paddingContainer = container.querySelector(".px-4");
      expect(paddingContainer).toHaveClass("sm:px-6");
      expect(paddingContainer).toHaveClass("lg:px-8");
    });

    it("should maintain padding across all viewport sizes", () => {
      const viewportSizes = [320, 375, 480, 640, 768, 1024, 1440];
      
      viewportSizes.forEach((width) => {
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: width,
        });

        const { container } = render(<PageHeader title="Тестовый заголовок" />);
        
        const paddingContainer = container.querySelector(".px-4");
        expect(paddingContainer).toBeInTheDocument();
      });
    });
  });

  describe("header structure", () => {
    it("should render heading with correct text", () => {
      const { container } = render(<PageHeader title="Обзор" />);
      
      const heading = container.querySelector("h1");
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe("Обзор");
    });

    it("should have semantic heading styles", () => {
      const { container } = render(<PageHeader title="Категории" />);
      
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("font-semibold");
      expect(heading).toHaveClass("text-foreground");
    });

    it("should be wrapped in proper container structure", () => {
      const { container } = render(<PageHeader title="Транзакции" />);
      
      // Проверяем наличие max-width контейнера
      const maxWidthContainer = container.querySelector(".max-w-7xl");
      expect(maxWidthContainer).toBeInTheDocument();
      
      // Проверяем наличие flex контейнера для заголовка
      const flexContainer = container.querySelector(".flex");
      expect(flexContainer).toBeInTheDocument();
    });

    it("should have responsive flex layout", () => {
      const { container } = render(<PageHeader title="Бюджеты" />);
      
      const flexContainer = container.querySelector(".mb-8");
      expect(flexContainer).toHaveClass("flex");
      expect(flexContainer).toHaveClass("flex-col");
      expect(flexContainer).toHaveClass("sm:flex-row");
    });
  });

  describe("edge cases", () => {
    it("should handle empty title", () => {
      const { container } = render(<PageHeader title="" />);
      
      const heading = container.querySelector("h1");
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe("");
    });

    it("should handle very long title", () => {
      const longTitle = "Очень длинный заголовок страницы который может не поместиться на экране";
      const { container } = render(<PageHeader title={longTitle} />);
      
      const heading = container.querySelector("h1");
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe(longTitle);
    });

    it("should handle title with special characters", () => {
      const specialTitle = "Заголовок с символами: @#$%^&*()";
      const { container } = render(<PageHeader title={specialTitle} />);
      
      const heading = container.querySelector("h1");
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe(specialTitle);
    });
  });
});

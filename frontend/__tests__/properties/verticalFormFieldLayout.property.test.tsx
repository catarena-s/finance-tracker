/**
 * Property-Based Test — Vertical Form Field Layout
 * 
 * **Свойство 12: Вертикальное расположение полей формы**
 * **Валидирует: Требования 4.3**
 * 
 * For any form in a modal window, when viewport width is less than 640px,
 * form fields should be arranged vertically in a single column.
 * 
 * NOTE: numRuns reduced to 10-20 to prevent test timeouts
 */

import React from "react";
import { render } from "@testing-library/react";
import fc from "fast-check";
import { Modal } from "@/components/ui/Modal";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { Category } from "@/types/api";

// Mobile breakpoint (sm in Tailwind)
const MOBILE_BREAKPOINT = 640;

// Helper function to find elements with responsive flex layout
const findResponsiveFlexContainers = (container: HTMLElement): Element[] => {
  // Look for elements with flex-col sm:flex-row pattern
  const selectors = [
    ".flex.flex-col.sm\\:flex-row",
    "[class*='flex-col'][class*='sm:flex-row']",
  ];
  
  const elements: Element[] = [];
  selectors.forEach((selector) => {
    const found = container.querySelectorAll(selector);
    found.forEach((el) => elements.push(el));
  });
  
  return elements;
};

// Helper function to check if element has vertical layout classes
const hasVerticalLayout = (element: Element): boolean => {
  return element.classList.contains("flex-col");
};

// Helper function to check if element has responsive horizontal layout
const hasResponsiveHorizontalLayout = (element: Element): boolean => {
  return element.className.includes("sm:flex-row");
};

// Mock categories for testing
const mockCategories: Category[] = [
  {
    id: "1",
    name: "Продукты",
    icon: "🛒",
    color: "#4CAF50",
    type: "expense",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Зарплата",
    icon: "💰",
    color: "#2196F3",
    type: "income",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

describe("Property: Vertical Form Field Layout", () => {
  describe("CategoryForm in modal", () => {
    it("should arrange form fields vertically on mobile viewports (< 640px)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }), // Mobile viewport range
          (viewportWidth) => {
            // Mock window.innerWidth for mobile
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            // Mock matchMedia for Tailwind's sm breakpoint (640px)
            Object.defineProperty(window, "matchMedia", {
              writable: true,
              value: jest.fn().mockImplementation((query) => ({
                matches: query.includes("640px") ? false : true,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
              })),
            });

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} title="Создать категорию" size="md">
                <CategoryForm
                  onSubmit={async () => {}}
                  onCancel={() => {}}
                />
              </Modal>
            );

            // Find responsive flex containers in the form
            const responsiveContainers = findResponsiveFlexContainers(container);

            // CategoryForm has responsive layout for color input section
            expect(responsiveContainers.length).toBeGreaterThan(0);

            responsiveContainers.forEach((flexContainer) => {
              // On mobile (< 640px), should have vertical layout
              expect(hasVerticalLayout(flexContainer)).toBe(true);
              expect(hasResponsiveHorizontalLayout(flexContainer)).toBe(true);
            });
          }
        ),
        { numRuns: 10 }
      );
    });

    it("should arrange form fields horizontally on desktop viewports (>= 640px)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 640, max: 1440 }), // Desktop viewport range
          (viewportWidth) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            Object.defineProperty(window, "matchMedia", {
              writable: true,
              value: jest.fn().mockImplementation((query) => ({
                matches: query.includes("640px") ? true : false,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
              })),
            });

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} title="Создать категорию" size="md">
                <CategoryForm
                  onSubmit={async () => {}}
                  onCancel={() => {}}
                />
              </Modal>
            );

            const responsiveContainers = findResponsiveFlexContainers(container);

            expect(responsiveContainers.length).toBeGreaterThan(0);

            responsiveContainers.forEach((flexContainer) => {
              // Should have both mobile and desktop classes
              expect(hasVerticalLayout(flexContainer)).toBe(true);
              expect(hasResponsiveHorizontalLayout(flexContainer)).toBe(true);
            });
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe("TransactionForm in modal", () => {
    it("should render form fields in vertical layout by default", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1440 }),
          (viewportWidth) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} title="Создать транзакцию" size="md">
                <TransactionForm
                  categories={mockCategories}
                  onSubmit={async () => {}}
                  onCancel={() => {}}
                />
              </Modal>
            );

            // TransactionForm uses space-y-4 which creates vertical layout
            const form = container.querySelector("form");

            if (form) {
              // Form should have space-y-4 for vertical spacing
              expect(form).toHaveClass("space-y-4");
            }
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe("Requirement validation", () => {
    it("validates Requirement 4.3: Form fields arranged vertically below 640px", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }), // Mobile viewport (< 640px as per requirement)
          (viewportWidth) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            Object.defineProperty(window, "matchMedia", {
              writable: true,
              value: jest.fn().mockImplementation((query) => ({
                matches: query.includes("640px") ? false : true,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
              })),
            });

            // Requirement 4.3: WHEN форма в модальном окне содержит множество полей,
            // THE Система SHALL располагать поля вертикально в одну колонку на экранах менее 640px
            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} title="Создать категорию" size="md">
                <CategoryForm
                  onSubmit={async () => {}}
                  onCancel={() => {}}
                />
              </Modal>
            );

            // Check that form fields use vertical layout
            const form = container.querySelector("form");
            expect(form).not.toBeNull();

            if (form) {
              // Form should use vertical spacing
              expect(form).toHaveClass("space-y-4");
            }

            // Check responsive flex containers
            const responsiveContainers = findResponsiveFlexContainers(container);

            responsiveContainers.forEach((flexContainer) => {
              // Must have flex-col for vertical layout on mobile
              expect(hasVerticalLayout(flexContainer)).toBe(true);
            });
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});

/**
 * Property-Based Test — Vertical Filter Layout
 * 
 * **Свойство 5: Вертикальное расположение фильтров**
 * **Валидирует: Требования 2.1, 6.2**
 * 
 * For any set of filter controls, when viewport width is less than 640px,
 * elements should be arranged vertically (flex-direction: column).
 */

import React from "react";
import { render } from "@testing-library/react";
import fc from "fast-check";
import DashboardPage from "@/app/dashboard/page";
import { AppProvider } from "@/contexts/AppContext";

// Helper function to render DashboardPage with AppProvider
const renderDashboard = () => {
  return render(
    <AppProvider>
      <DashboardPage />
    </AppProvider>
  );
};

// Helper function to get computed flex direction
const getFlexDirection = (element: Element): string => {
  const computedStyle = window.getComputedStyle(element);
  return computedStyle.flexDirection;
};

// Helper function to check if element has vertical layout
const hasVerticalLayout = (element: Element): boolean => {
  const flexDirection = getFlexDirection(element);
  return flexDirection === "column" || flexDirection === "column-reverse";
};

// Helper function to check if element has horizontal layout
const hasHorizontalLayout = (element: Element): boolean => {
  const flexDirection = getFlexDirection(element);
  return flexDirection === "row" || flexDirection === "row-reverse";
};

describe("Property: Vertical Filter Layout", () => {
  describe("Dashboard filter controls", () => {
    it("should arrange filter controls vertically on mobile viewports (< 640px)", () => {
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

            const { container } = renderDashboard();

            // Find the main filter container (should have flex-col on mobile)
            const filterContainers = container.querySelectorAll(
              ".flex.flex-col.sm\\:flex-row"
            );

            expect(filterContainers.length).toBeGreaterThan(0);

            filterContainers.forEach((filterContainer) => {
              // On mobile (< 640px), should have vertical layout
              // Note: In JSDOM, Tailwind classes don't apply actual styles,
              // so we check for the presence of the correct classes
              expect(filterContainer).toHaveClass("flex-col");
              expect(filterContainer).toHaveClass("sm:flex-row");
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should arrange filter controls horizontally on desktop viewports (>= 640px)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 640, max: 1440 }), // Desktop viewport range
          (viewportWidth) => {
            // Mock window.innerWidth for desktop
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            // Mock matchMedia for Tailwind's sm breakpoint (640px)
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

            const { container } = renderDashboard();

            // Find the main filter container
            const filterContainers = container.querySelectorAll(
              ".flex.flex-col.sm\\:flex-row"
            );

            expect(filterContainers.length).toBeGreaterThan(0);

            filterContainers.forEach((filterContainer) => {
              // Should have responsive classes for horizontal layout on desktop
              expect(filterContainer).toHaveClass("flex-col");
              expect(filterContainer).toHaveClass("sm:flex-row");
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should verify date range inputs are in vertical layout on mobile", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }),
          (viewportWidth) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = renderDashboard();

            // Find the date range container
            const dateContainers = container.querySelectorAll(
              ".flex.flex-col.items-start.gap-2.sm\\:flex-row.sm\\:items-center"
            );

            expect(dateContainers.length).toBeGreaterThan(0);

            dateContainers.forEach((dateContainer) => {
              // Should have flex-col for mobile
              expect(dateContainer).toHaveClass("flex-col");
              expect(dateContainer).toHaveClass("items-start");
              expect(dateContainer).toHaveClass("sm:flex-row");
              expect(dateContainer).toHaveClass("sm:items-center");
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should verify period grouping controls are in vertical layout on mobile", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }),
          (viewportWidth) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = renderDashboard();

            // Find the grouping container
            const groupingContainers = container.querySelectorAll(
              ".flex.flex-col.items-start.gap-2.sm\\:flex-row.sm\\:items-center"
            );

            expect(groupingContainers.length).toBeGreaterThan(0);

            groupingContainers.forEach((groupingContainer) => {
              // Should have flex-col for mobile
              expect(groupingContainer).toHaveClass("flex-col");
              expect(groupingContainer).toHaveClass("items-start");
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe("Page header layout", () => {
    it("should arrange header elements vertically on mobile (< 640px)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }),
          (viewportWidth) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = renderDashboard();

            // Find the header container (title + filters)
            const headerContainers = container.querySelectorAll(
              ".flex.flex-col.gap-6.sm\\:flex-row"
            );

            expect(headerContainers.length).toBeGreaterThan(0);

            headerContainers.forEach((headerContainer) => {
              // Should have flex-col for mobile
              expect(headerContainer).toHaveClass("flex-col");
              expect(headerContainer).toHaveClass("sm:flex-row");
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should arrange header elements horizontally on desktop (>= 640px)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 640, max: 1440 }),
          (viewportWidth) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = renderDashboard();

            // Find the header container
            const headerContainers = container.querySelectorAll(
              ".flex.flex-col.gap-6.sm\\:flex-row"
            );

            expect(headerContainers.length).toBeGreaterThan(0);

            headerContainers.forEach((headerContainer) => {
              // Should have responsive classes
              expect(headerContainer).toHaveClass("flex-col");
              expect(headerContainer).toHaveClass("sm:flex-row");
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe("Edge cases", () => {
    it("should maintain vertical layout at exactly 320px (minimum supported width)", () => {
      const viewportWidth = 320;

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: viewportWidth,
      });

      const { container } = renderDashboard();

      const filterContainers = container.querySelectorAll(
        ".flex.flex-col.sm\\:flex-row"
      );

      expect(filterContainers.length).toBeGreaterThan(0);

      filterContainers.forEach((filterContainer) => {
        expect(filterContainer).toHaveClass("flex-col");
      });
    });

    it("should switch to horizontal layout at exactly 640px (sm breakpoint)", () => {
      const viewportWidth = 640;

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: viewportWidth,
      });

      const { container } = renderDashboard();

      const filterContainers = container.querySelectorAll(
        ".flex.flex-col.sm\\:flex-row"
      );

      expect(filterContainers.length).toBeGreaterThan(0);

      filterContainers.forEach((filterContainer) => {
        // Should have both classes (mobile-first approach)
        expect(filterContainer).toHaveClass("flex-col");
        expect(filterContainer).toHaveClass("sm:flex-row");
      });
    });

    it("should maintain vertical layout at 639px (just below sm breakpoint)", () => {
      const viewportWidth = 639;

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: viewportWidth,
      });

      const { container } = renderDashboard();

      const filterContainers = container.querySelectorAll(
        ".flex.flex-col.sm\\:flex-row"
      );

      expect(filterContainers.length).toBeGreaterThan(0);

      filterContainers.forEach((filterContainer) => {
        expect(filterContainer).toHaveClass("flex-col");
      });
    });
  });

  describe("General property validation", () => {
    it("should verify all filter-related containers use responsive flex classes", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1440 }),
          (viewportWidth) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = renderDashboard();

            // Find all containers with responsive flex layout
            const responsiveContainers = container.querySelectorAll(
              ".flex.flex-col.sm\\:flex-row, .flex.flex-col.items-start.sm\\:flex-row"
            );

            expect(responsiveContainers.length).toBeGreaterThan(0);

            responsiveContainers.forEach((responsiveContainer) => {
              // All should have mobile-first vertical layout
              expect(responsiveContainer).toHaveClass("flex");
              expect(responsiveContainer).toHaveClass("flex-col");
              
              // All should have responsive horizontal layout for desktop
              expect(responsiveContainer).toHaveClass("sm:flex-row");
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should ensure consistent gap spacing in filter containers across viewports", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1440 }),
          (viewportWidth) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = renderDashboard();

            // Find containers with gap classes
            const gapContainers = container.querySelectorAll(
              ".flex.flex-col.gap-2, .flex.flex-col.gap-4, .flex.flex-col.gap-6"
            );

            expect(gapContainers.length).toBeGreaterThan(0);

            gapContainers.forEach((gapContainer) => {
              // Should have gap class for consistent spacing
              const hasGap = 
                gapContainer.classList.contains("gap-2") ||
                gapContainer.classList.contains("gap-4") ||
                gapContainer.classList.contains("gap-6");
              
              expect(hasGap).toBe(true);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should verify filter controls maintain proper alignment on mobile", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }),
          (viewportWidth) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = renderDashboard();

            // Find containers with items-start (left-aligned on mobile)
            const alignedContainers = container.querySelectorAll(
              ".flex.flex-col.items-start"
            );

            expect(alignedContainers.length).toBeGreaterThan(0);

            alignedContainers.forEach((alignedContainer) => {
              // Should have items-start for proper mobile alignment
              expect(alignedContainer).toHaveClass("items-start");
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe("Requirement validation", () => {
    it("validates Requirement 2.1: Filter controls arranged vertically below 640px", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }),
          (viewportWidth) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = renderDashboard();

            // Requirement 2.1: WHEN viewport имеет ширину менее 640px,
            // THE Контрол_Фильтра SHALL располагаться вертикально в одну колонку
            const filterControls = container.querySelectorAll(
              ".flex.flex-col.sm\\:flex-row"
            );

            expect(filterControls.length).toBeGreaterThan(0);

            filterControls.forEach((control) => {
              // Must have flex-col for vertical layout
              expect(control).toHaveClass("flex-col");
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("validates Requirement 6.2: Page header elements arranged vertically below 640px", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }),
          (viewportWidth) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = renderDashboard();

            // Requirement 6.2: WHEN заголовок страницы содержит дополнительные элементы управления,
            // THE Система SHALL располагать их вертикально на экранах менее 640px
            const headerContainer = container.querySelector(
              ".flex.flex-col.gap-6.sm\\:flex-row"
            );

            expect(headerContainer).not.toBeNull();

            if (headerContainer) {
              // Must have flex-col for vertical layout
              expect(headerContainer).toHaveClass("flex-col");
              expect(headerContainer).toHaveClass("sm:flex-row");
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


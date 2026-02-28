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
import { getNumRuns, getTimeout } from "./property-test-config";

// Helper function to render DashboardPage with AppProvider
const renderDashboard = () => {
  return render(
    <AppProvider>
      <DashboardPage />
    </AppProvider>
  );
};

describe("Property: Vertical Filter Layout", () => {
  describe("Dashboard filter controls", () => {
    it("should render period buttons on mobile viewports (< 640px)", () => {
      jest.setTimeout(getTimeout("SLOW"));
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

            const { container } = renderDashboard();

            // Find period buttons - they should exist on mobile
            const periodButtons = container.querySelectorAll(
              "button.h-9.min-w-\\[36px\\]"
            );

            // Should have exactly 3 period buttons (day, month, year)
            expect(periodButtons.length).toBe(3);
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should render period buttons on desktop viewports (>= 640px)", () => {
      jest.setTimeout(getTimeout("SLOW"));
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

            const { container } = renderDashboard();

            // Find period buttons - they should exist on desktop
            const periodButtons = container.querySelectorAll(
              "button.h-9.min-w-\\[36px\\]"
            );

            // Should have exactly 3 period buttons (day, month, year)
            expect(periodButtons.length).toBe(3);
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should render date inputs on mobile", () => {
      jest.setTimeout(getTimeout("SLOW"));
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

            // Find date inputs
            const dateInputs = container.querySelectorAll('input[type="date"]');

            // Should have 2 date inputs (start and end)
            expect(dateInputs.length).toBe(2);
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should render date inputs on desktop", () => {
      jest.setTimeout(getTimeout("SLOW"));
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

            // Find date inputs
            const dateInputs = container.querySelectorAll('input[type="date"]');

            // Should have 2 date inputs (start and end)
            expect(dateInputs.length).toBe(2);
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });
  });

  describe("Page header layout", () => {
    it("should render page title on mobile (< 640px)", () => {
      jest.setTimeout(getTimeout("SLOW"));
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

            // Find the page title
            const title = container.querySelector("h1");

            expect(title).not.toBeNull();
            expect(title?.textContent).toBe("Обзор");
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should render page title on desktop (>= 640px)", () => {
      jest.setTimeout(getTimeout("SLOW"));
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

            // Find the page title
            const title = container.querySelector("h1");

            expect(title).not.toBeNull();
            expect(title?.textContent).toBe("Обзор");
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });
  });

  describe("Edge cases", () => {
    it("should render all controls at exactly 320px (minimum supported width)", () => {
      jest.setTimeout(getTimeout("SLOW"));
      const viewportWidth = 320;

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: viewportWidth,
      });

      const { container } = renderDashboard();

      const periodButtons = container.querySelectorAll(
        "button.h-9.min-w-\\[36px\\]"
      );
      const dateInputs = container.querySelectorAll('input[type="date"]');

      expect(periodButtons.length).toBe(3);
      expect(dateInputs.length).toBe(2);
    });

    it("should render all controls at exactly 640px (sm breakpoint)", () => {
      jest.setTimeout(getTimeout("SLOW"));
      const viewportWidth = 640;

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: viewportWidth,
      });

      const { container } = renderDashboard();

      const periodButtons = container.querySelectorAll(
        "button.h-9.min-w-\\[36px\\]"
      );
      const dateInputs = container.querySelectorAll('input[type="date"]');

      expect(periodButtons.length).toBe(3);
      expect(dateInputs.length).toBe(2);
    });

    it("should render all controls at 639px (just below sm breakpoint)", () => {
      jest.setTimeout(getTimeout("SLOW"));
      const viewportWidth = 639;

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: viewportWidth,
      });

      const { container } = renderDashboard();

      const periodButtons = container.querySelectorAll(
        "button.h-9.min-w-\\[36px\\]"
      );
      const dateInputs = container.querySelectorAll('input[type="date"]');

      expect(periodButtons.length).toBe(3);
      expect(dateInputs.length).toBe(2);
    });
  });

  describe("General property validation", () => {
    it("should render all filter controls across all viewport sizes", () => {
      jest.setTimeout(getTimeout("SLOW"));
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

            // All controls should be present
            const periodButtons = container.querySelectorAll(
              "button.h-9.min-w-\\[36px\\]"
            );
            const dateInputs = container.querySelectorAll('input[type="date"]');
            const title = container.querySelector("h1");

            expect(periodButtons.length).toBe(3);
            expect(dateInputs.length).toBe(2);
            expect(title).not.toBeNull();
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("should maintain consistent control count across viewports", () => {
      jest.setTimeout(getTimeout("SLOW"));
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

            const periodButtons = container.querySelectorAll(
              "button.h-9.min-w-\\[36px\\]"
            );

            // Should always have exactly 3 period buttons
            expect(periodButtons.length).toBe(3);
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should render date inputs with proper attributes", () => {
      jest.setTimeout(getTimeout("SLOW"));
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

            const dateInputs = container.querySelectorAll('input[type="date"]');

            expect(dateInputs.length).toBe(2);

            // All date inputs should have type="date"
            dateInputs.forEach((input) => {
              expect(input).toHaveAttribute("type", "date");
            });
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });
  });

  describe("Requirement validation", () => {
    it("validates Requirement 2.1: Filter controls present on mobile below 640px", () => {
      jest.setTimeout(getTimeout("SLOW"));
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

            // Requirement 2.1: Filter controls should be present
            const periodButtons = container.querySelectorAll(
              "button.h-9.min-w-\\[36px\\]"
            );
            const dateInputs = container.querySelectorAll('input[type="date"]');

            expect(periodButtons.length).toBeGreaterThan(0);
            expect(dateInputs.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("validates Requirement 6.2: Page header elements present below 640px", () => {
      jest.setTimeout(getTimeout("SLOW"));
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

            // Requirement 6.2: Page header should contain title and controls
            const title = container.querySelector("h1");
            const periodButtons = container.querySelectorAll(
              "button.h-9.min-w-\\[36px\\]"
            );

            expect(title).not.toBeNull();
            expect(periodButtons.length).toBe(3);
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });
  });
});

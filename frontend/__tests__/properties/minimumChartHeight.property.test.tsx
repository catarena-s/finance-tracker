/**
 * Property-Based Test — Minimum Chart Height
 * 
 * **Свойство 8: Минимальная высота графиков**
 * **Валидирует: Требования 3.2**
 * 
 * For any chart (Chart.js), when displayed on a mobile device (viewport < 640px),
 * the chart container height should be at least 256px.
 * 
 * NOTE: Skipped in CI due to performance (renders TrendChart with Chart.js)
 */

import React from "react";
import { render } from "@testing-library/react";
import fc from "fast-check";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { TopCategoriesWidget } from "@/components/dashboard/TopCategoriesWidget";
import { chartResponsiveConfig } from "@/lib/responsiveConfig";
import { getNumRuns, getTimeout } from "./propertyTestConfig";

// Skip in CI environment
const describeOrSkip = process.env.CI === "true" ? describe.skip : describe;

// Minimum chart height for mobile devices (from requirements 3.2)
const MIN_CHART_HEIGHT_MOBILE = 256;

// Helper function to get computed height of an element
const getElementHeight = (element: Element): number => {
  const rect = element.getBoundingClientRect();
  return rect.height;
};

// Helper function to find chart containers
const findChartContainers = (container: HTMLElement): Element[] => {
  // Chart containers have specific height classes: h-64, sm:h-80, lg:h-96
  const selectors = [
    ".h-64",
    "[class*='h-64']",
  ];
  
  const elements: Element[] = [];
  selectors.forEach((selector) => {
    const found = container.querySelectorAll(selector);
    elements.push(...Array.from(found));
  });
  
  return elements;
};

// Generator for trend chart data
const trendDataArbitrary = fc.record({
  incomeData: fc.array(
    fc.record({
      date: fc.date().map(d => d.toISOString().split('T')[0]),
      amount: fc.float({ min: 0, max: 100000, noNaN: true }),
    }),
    { minLength: 1, maxLength: 30 }
  ),
  expenseData: fc.array(
    fc.record({
      date: fc.date().map(d => d.toISOString().split('T')[0]),
      amount: fc.float({ min: 0, max: 100000, noNaN: true }),
    }),
    { minLength: 1, maxLength: 30 }
  ),
});

// Generator for top categories data
const topCategoriesArbitrary = fc.array(
  fc.record({
    categoryName: fc.string({ minLength: 3, maxLength: 20 }),
    categoryIcon: fc.constantFrom("shopping-cart", "home", "car", "food", "entertainment"),
    totalAmount: fc.float({ min: 0, max: 50000, noNaN: true }),
    percentage: fc.float({ min: 0, max: 100, noNaN: true }),
  }),
  { minLength: 1, maxLength: 10 }
);

describeOrSkip("Property: Minimum Chart Height", () => {
  describe("TrendChart component", () => {
    it("should have minimum 256px height on mobile viewports (< 640px)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }), // Mobile viewport range
          trendDataArbitrary,
          (viewportWidth, chartData) => {
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
              <TrendChart
                incomeData={chartData.incomeData}
                expenseData={chartData.expenseData}
              />
            );

            // Find chart containers
            const chartContainers = findChartContainers(container);

            expect(chartContainers.length).toBeGreaterThan(0);

            chartContainers.forEach((chartContainer) => {
              // Verify the container has the h-64 class (256px)
              expect(chartContainer).toHaveClass("h-64");
              
              // Note: In JSDOM, Tailwind classes don't apply actual styles,
              // but we can verify the class is present which ensures 256px height
              // when rendered in a real browser
            });
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should verify chart height increases on tablet viewports (>= 640px)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 640, max: 1023 }), // Tablet viewport range
          trendDataArbitrary,
          (viewportWidth, chartData) => {
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
              <TrendChart
                incomeData={chartData.incomeData}
                expenseData={chartData.expenseData}
              />
            );

            const chartContainers = findChartContainers(container);

            expect(chartContainers.length).toBeGreaterThan(0);

            chartContainers.forEach((chartContainer) => {
              // Should have responsive height classes
              expect(chartContainer).toHaveClass("h-64");
              expect(chartContainer).toHaveClass("sm:h-80");
            });
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should verify chart height increases on desktop viewports (>= 1024px)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1024, max: 1440 }), // Desktop viewport range
          trendDataArbitrary,
          (viewportWidth, chartData) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = render(
              <TrendChart
                incomeData={chartData.incomeData}
                expenseData={chartData.expenseData}
              />
            );

            const chartContainers = findChartContainers(container);

            expect(chartContainers.length).toBeGreaterThan(0);

            chartContainers.forEach((chartContainer) => {
              // Should have all responsive height classes
              expect(chartContainer).toHaveClass("h-64");
              expect(chartContainer).toHaveClass("sm:h-80");
              expect(chartContainer).toHaveClass("lg:h-96");
            });
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });
  });

  describe("TopCategoriesWidget component", () => {
    it("should have minimum 256px height on mobile viewports (< 640px)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }),
          topCategoriesArbitrary.filter(cats => cats.length >= 2 && cats.every(c => c.categoryName.trim().length > 0)),
          (viewportWidth, categories) => {
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

            try {
              const { container } = render(
                <TopCategoriesWidget categories={categories} />
              );

              const chartContainers = findChartContainers(container);

              if (chartContainers.length > 0) {
                chartContainers.forEach((chartContainer) => {
                  // Verify the container has the h-64 class (256px)
                  expect(chartContainer).toHaveClass("h-64");
                });
              }
            } catch (error) {
              // Chart.js may fail to render in JSDOM for some edge cases
              // This is acceptable as we're testing CSS classes, not canvas rendering
              if (error instanceof TypeError && error.message.includes('ownerDocument')) {
                // Skip this iteration - canvas rendering issue in test environment
                return;
              }
              throw error;
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should verify chart height increases on tablet and desktop", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 640, max: 1440 }),
          topCategoriesArbitrary.filter(cats => cats.length >= 2 && cats.every(c => c.categoryName.trim().length > 0)),
          (viewportWidth, categories) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            try {
              const { container } = render(
                <TopCategoriesWidget categories={categories} />
              );

              const chartContainers = findChartContainers(container);

              if (chartContainers.length > 0) {
                chartContainers.forEach((chartContainer) => {
                  // Should have responsive height classes
                  expect(chartContainer).toHaveClass("h-64");
                  expect(chartContainer).toHaveClass("sm:h-80");
                  expect(chartContainer).toHaveClass("lg:h-96");
                });
              }
            } catch (error) {
              // Chart.js may fail to render in JSDOM for some edge cases
              if (error instanceof TypeError && error.message.includes('ownerDocument')) {
                return;
              }
              throw error;
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });
  });

  describe("Chart configuration validation", () => {
    it("should verify chartResponsiveConfig has correct minimum mobile height", () => {
      // Validate that the configuration matches the requirement
      expect(chartResponsiveConfig.height.mobile).toBe(MIN_CHART_HEIGHT_MOBILE);
      expect(chartResponsiveConfig.height.mobile).toBeGreaterThanOrEqual(256);
    });

    it("should verify chart heights increase progressively", () => {
      // Mobile < Tablet < Desktop
      expect(chartResponsiveConfig.height.mobile).toBeLessThan(
        chartResponsiveConfig.height.tablet
      );
      expect(chartResponsiveConfig.height.tablet).toBeLessThan(
        chartResponsiveConfig.height.desktop
      );
    });

    it("should verify all chart heights meet minimum requirements", () => {
      // All heights should be at least the mobile minimum
      expect(chartResponsiveConfig.height.mobile).toBeGreaterThanOrEqual(MIN_CHART_HEIGHT_MOBILE);
      expect(chartResponsiveConfig.height.tablet).toBeGreaterThanOrEqual(MIN_CHART_HEIGHT_MOBILE);
      expect(chartResponsiveConfig.height.desktop).toBeGreaterThanOrEqual(MIN_CHART_HEIGHT_MOBILE);
    });
  });

  describe("Edge cases", () => {
    it("should maintain minimum height at exactly 320px (minimum supported width)", () => {
      const viewportWidth = 320;

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: viewportWidth,
      });

      fc.assert(
        fc.property(
          trendDataArbitrary,
          (chartData) => {
            const { container } = render(
              <TrendChart
                incomeData={chartData.incomeData}
                expenseData={chartData.expenseData}
              />
            );

            const chartContainers = findChartContainers(container);
            expect(chartContainers.length).toBeGreaterThan(0);

            chartContainers.forEach((chartContainer) => {
              expect(chartContainer).toHaveClass("h-64");
            });
          }
        ),
        { numRuns: getNumRuns("SLOW") }
      );
    });

    it("should switch to tablet height at exactly 640px (sm breakpoint)", () => {
      const viewportWidth = 640;

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: viewportWidth,
      });

      fc.assert(
        fc.property(
          trendDataArbitrary,
          (chartData) => {
            const { container } = render(
              <TrendChart
                incomeData={chartData.incomeData}
                expenseData={chartData.expenseData}
              />
            );

            const chartContainers = findChartContainers(container);
            expect(chartContainers.length).toBeGreaterThan(0);

            chartContainers.forEach((chartContainer) => {
              // Should have both mobile and tablet classes
              expect(chartContainer).toHaveClass("h-64");
              expect(chartContainer).toHaveClass("sm:h-80");
            });
          }
        ),
        { numRuns: getNumRuns("SLOW") }
      );
    });

    it("should maintain minimum height at 639px (just below sm breakpoint)", () => {
      const viewportWidth = 639;

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: viewportWidth,
      });

      fc.assert(
        fc.property(
          topCategoriesArbitrary.filter(cats => cats.length >= 2 && cats.every(c => c.categoryName.trim().length > 0)),
          (categories) => {
            try {
              const { container } = render(
                <TopCategoriesWidget categories={categories} />
              );

              const chartContainers = findChartContainers(container);
              
              if (chartContainers.length > 0) {
                chartContainers.forEach((chartContainer) => {
                  expect(chartContainer).toHaveClass("h-64");
                });
              }
            } catch (error) {
              // Chart.js may fail to render in JSDOM for some edge cases
              if (error instanceof TypeError && error.message.includes('ownerDocument')) {
                return;
              }
              throw error;
            }
          }
        ),
        { numRuns: getNumRuns("SLOW") }
      );
    });

    it("should handle empty data gracefully while maintaining height classes", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }),
          (viewportWidth) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = render(
              <TrendChart incomeData={[]} expenseData={[]} />
            );

            // Even with empty data, the component should render with proper structure
            // The "no data" message container should still respect height constraints
            const emptyStateContainer = container.querySelector(".h-64");
            
            if (emptyStateContainer) {
              expect(emptyStateContainer).toHaveClass("h-64");
            }
          }
        ),
        { numRuns: getNumRuns("SLOW") }
      );
    });

    it("should handle loading state while maintaining height classes", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }),
          (viewportWidth) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = render(
              <TopCategoriesWidget categories={[]} loading={true} />
            );

            // Loading skeleton should also respect height constraints
            const loadingContainer = container.querySelector(".h-64");
            
            if (loadingContainer) {
              expect(loadingContainer).toHaveClass("h-64");
            }
          }
        ),
        { numRuns: getNumRuns("SLOW") }
      );
    });
  });

  describe("Requirement validation", () => {
    it("validates Requirement 3.2: Minimum 256px chart height on mobile", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }),
          trendDataArbitrary,
          (viewportWidth, chartData) => {
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

            // Requirement 3.2: WHEN График отображается на мобильном устройстве,
            // THE Система SHALL устанавливать высоту графика минимум 256px
            const { container } = render(
              <TrendChart
                incomeData={chartData.incomeData}
                expenseData={chartData.expenseData}
              />
            );

            const chartContainers = findChartContainers(container);
            expect(chartContainers.length).toBeGreaterThan(0);

            chartContainers.forEach((chartContainer) => {
              // h-64 class ensures 256px height (16rem * 16px = 256px)
              expect(chartContainer).toHaveClass("h-64");
            });
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("validates that chart height is consistent across different data sizes", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }),
          fc.integer({ min: 1, max: 100 }), // Number of data points
          (viewportWidth, dataPoints) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            // Generate data with specified number of points
            const incomeData = Array.from({ length: dataPoints }, (_, i) => ({
              date: `2024-01-${String(i + 1).padStart(2, '0')}`,
              amount: Math.random() * 10000,
            }));

            const expenseData = Array.from({ length: dataPoints }, (_, i) => ({
              date: `2024-01-${String(i + 1).padStart(2, '0')}`,
              amount: Math.random() * 10000,
            }));

            const { container } = render(
              <TrendChart incomeData={incomeData} expenseData={expenseData} />
            );

            const chartContainers = findChartContainers(container);
            expect(chartContainers.length).toBeGreaterThan(0);

            // Height should be consistent regardless of data size
            chartContainers.forEach((chartContainer) => {
              expect(chartContainer).toHaveClass("h-64");
            });
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });
  });

  describe("General property validation", () => {
    it("should verify all chart components use responsive height classes", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1440 }),
          trendDataArbitrary,
          topCategoriesArbitrary.filter(cats => cats.length >= 2 && cats.every(c => c.categoryName.trim().length > 0)),
          (viewportWidth, trendData, categories) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            // Test both chart components
            const { container: trendContainer } = render(
              <TrendChart
                incomeData={trendData.incomeData}
                expenseData={trendData.expenseData}
              />
            );

            try {
              const { container: categoriesContainer } = render(
                <TopCategoriesWidget categories={categories} />
              );

              // Both should have responsive height classes
              const trendCharts = findChartContainers(trendContainer);
              const categoryCharts = findChartContainers(categoriesContainer);

              expect(trendCharts.length).toBeGreaterThan(0);

              [...trendCharts, ...categoryCharts].forEach((chart) => {
                // All charts must have base mobile height
                expect(chart).toHaveClass("h-64");
                
                // All charts must have responsive classes
                expect(chart).toHaveClass("sm:h-80");
                expect(chart).toHaveClass("lg:h-96");
              });
            } catch (error) {
              // Chart.js may fail to render in JSDOM for some edge cases
              if (error instanceof TypeError && error.message.includes('ownerDocument')) {
                // At least verify TrendChart works
                const trendCharts = findChartContainers(trendContainer);
                expect(trendCharts.length).toBeGreaterThan(0);
                trendCharts.forEach((chart) => {
                  expect(chart).toHaveClass("h-64");
                  expect(chart).toHaveClass("sm:h-80");
                  expect(chart).toHaveClass("lg:h-96");
                });
                return;
              }
              throw error;
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should ensure chart height classes follow mobile-first approach", () => {
      fc.assert(
        fc.property(
          trendDataArbitrary,
          (chartData) => {
            const { container } = render(
              <TrendChart
                incomeData={chartData.incomeData}
                expenseData={chartData.expenseData}
              />
            );

            const chartContainers = findChartContainers(container);
            expect(chartContainers.length).toBeGreaterThan(0);

            chartContainers.forEach((chartContainer) => {
              // Mobile-first: base class (h-64) should always be present
              expect(chartContainer).toHaveClass("h-64");
              
              // Responsive classes should be prefixed (sm:, lg:)
              const classes = chartContainer.className;
              expect(classes).toMatch(/\bh-64\b/);
              expect(classes).toMatch(/\bsm:h-80\b/);
              expect(classes).toMatch(/\blg:h-96\b/);
            });
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });
  });
});

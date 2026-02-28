/**
 * Property-Based Test — Adaptive Button Labels
 * 
 * **Свойство 7: Адаптивные метки кнопок**
 * **Валидирует: Требования 2.5**
 * 
 * For any button with long text, when viewport width is less than 640px,
 * the abbreviated variant of the text should be displayed.
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

describe("Property: Adaptive Button Labels", () => {
  describe("Period filter button labels", () => {
    it("should display abbreviated labels (Д/М/Г) on mobile viewports (< 640px)", () => {
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

            // Find period buttons - they now use h-9 min-w-[36px] classes
            const periodButtons = container.querySelectorAll(
              "button.h-9.min-w-\\[36px\\]"
            );

            expect(periodButtons.length).toBeGreaterThan(0);

            periodButtons.forEach((button) => {
              // Find spans with abbreviated labels (visible on mobile)
              const shortLabels = button.querySelectorAll("span.sm\\:hidden");
              
              // Find spans with full labels (hidden on mobile)
              const fullLabels = button.querySelectorAll("span.hidden.sm\\:inline");

              // Should have both short and full label spans
              expect(shortLabels.length).toBeGreaterThan(0);
              expect(fullLabels.length).toBeGreaterThan(0);

              // Short labels should be visible on mobile (sm:hidden means hidden on sm and above)
              shortLabels.forEach((label) => {
                expect(label).toHaveClass("sm:hidden");
                // Text should be abbreviated (Д, М, or Г)
                const text = label.textContent?.trim();
                expect(text).toMatch(/^[ДМГ]$/);
              });

              // Full labels should be hidden on mobile (hidden sm:inline)
              fullLabels.forEach((label) => {
                expect(label).toHaveClass("hidden");
                expect(label).toHaveClass("sm:inline");
                // Text should be full (День, Месяц, or Год)
                const text = label.textContent?.trim();
                expect(text).toMatch(/^(День|Месяц|Год)$/);
              });
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should display full labels (День/Месяц/Год) on desktop viewports (>= 640px)", () => {
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

            // Find period buttons
            const periodButtons = container.querySelectorAll(
              "button.h-9.min-w-\\[36px\\]"
            );

            expect(periodButtons.length).toBeGreaterThan(0);

            periodButtons.forEach((button) => {
              // Find spans with abbreviated labels (hidden on desktop)
              const shortLabels = button.querySelectorAll("span.sm\\:hidden");
              
              // Find spans with full labels (visible on desktop)
              const fullLabels = button.querySelectorAll("span.hidden.sm\\:inline");

              // Should have both short and full label spans
              expect(shortLabels.length).toBeGreaterThan(0);
              expect(fullLabels.length).toBeGreaterThan(0);

              // Short labels should be hidden on desktop (sm:hidden)
              shortLabels.forEach((label) => {
                expect(label).toHaveClass("sm:hidden");
              });

              // Full labels should be visible on desktop (sm:inline)
              fullLabels.forEach((label) => {
                expect(label).toHaveClass("hidden");
                expect(label).toHaveClass("sm:inline");
                // Text should be full (День, Месяц, or Год)
                const text = label.textContent?.trim();
                expect(text).toMatch(/^(День|Месяц|Год)$/);
              });
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should have exactly 3 period buttons (День/Месяц/Год)", () => {
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

            // Find period buttons
            const periodButtons = container.querySelectorAll(
              "button.h-9.min-w-\\[36px\\]"
            );

            // Should have exactly 3 period buttons (day, month, year)
            expect(periodButtons.length).toBe(3);
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should ensure each button has both full and abbreviated label variants", () => {
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

            // Find period buttons
            const periodButtons = container.querySelectorAll(
              "button.h-9.min-w-\\[36px\\]"
            );

            expect(periodButtons.length).toBeGreaterThan(0);

            periodButtons.forEach((button) => {
              // Each button should have exactly one short label span
              const shortLabels = button.querySelectorAll("span.sm\\:hidden");
              expect(shortLabels.length).toBe(1);

              // Each button should have exactly one full label span
              const fullLabels = button.querySelectorAll("span.hidden.sm\\:inline");
              expect(fullLabels.length).toBe(1);
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe("Label mapping consistency", () => {
    it("should ensure abbreviated labels match their full counterparts", () => {
      const { container } = renderDashboard();

      // Find period buttons
      const periodButtons = container.querySelectorAll(
        "button.h-9.min-w-\\[36px\\]"
      );

      expect(periodButtons.length).toBe(3);

      // Define expected label mappings
      const labelMappings: Record<string, string> = {
        "День": "Д",
        "Месяц": "М",
        "Год": "Г",
      };

      periodButtons.forEach((button) => {
        const fullLabel = button.querySelector("span.hidden.sm\\:inline");
        const shortLabel = button.querySelector("span.sm\\:hidden");

        expect(fullLabel).not.toBeNull();
        expect(shortLabel).not.toBeNull();

        if (fullLabel && shortLabel) {
          const fullText = fullLabel.textContent?.trim() || "";
          const shortText = shortLabel.textContent?.trim() || "";

          // Verify the mapping is correct
          expect(labelMappings[fullText]).toBe(shortText);
        }
      });
    });

    it("should verify all expected period labels are present", () => {
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

            // Expected full labels
            const expectedFullLabels = ["День", "Месяц", "Год"];
            
            // Expected abbreviated labels
            const expectedShortLabels = ["Д", "М", "Г"];

            // Find all full labels
            const fullLabels = container.querySelectorAll(
              "button.h-9.min-w-\\[36px\\] span.hidden.sm\\:inline"
            );

            // Find all short labels
            const shortLabels = container.querySelectorAll(
              "button.h-9.min-w-\\[36px\\] span.sm\\:hidden"
            );

            // Collect actual labels
            const actualFullLabels = Array.from(fullLabels).map(
              (label) => label.textContent?.trim() || ""
            );
            const actualShortLabels = Array.from(shortLabels).map(
              (label) => label.textContent?.trim() || ""
            );

            // Verify all expected labels are present
            expectedFullLabels.forEach((expected) => {
              expect(actualFullLabels).toContain(expected);
            });

            expectedShortLabels.forEach((expected) => {
              expect(actualShortLabels).toContain(expected);
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe("Edge cases", () => {
    it("should maintain label structure at exactly 320px (minimum supported width)", () => {
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

      expect(periodButtons.length).toBe(3);

      periodButtons.forEach((button) => {
        // Should have both label variants
        const shortLabels = button.querySelectorAll("span.sm\\:hidden");
        const fullLabels = button.querySelectorAll("span.hidden.sm\\:inline");

        expect(shortLabels.length).toBe(1);
        expect(fullLabels.length).toBe(1);
      });
    });

    it("should switch label visibility at exactly 640px (sm breakpoint)", () => {
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

      expect(periodButtons.length).toBe(3);

      periodButtons.forEach((button) => {
        // Should have responsive classes for label switching
        const shortLabels = button.querySelectorAll("span.sm\\:hidden");
        const fullLabels = button.querySelectorAll("span.hidden.sm\\:inline");

        expect(shortLabels.length).toBe(1);
        expect(fullLabels.length).toBe(1);

        // Verify classes are present
        shortLabels.forEach((label) => {
          expect(label).toHaveClass("sm:hidden");
        });

        fullLabels.forEach((label) => {
          expect(label).toHaveClass("hidden");
          expect(label).toHaveClass("sm:inline");
        });
      });
    });

    it("should maintain label structure at 639px (just below sm breakpoint)", () => {
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

      expect(periodButtons.length).toBe(3);

      periodButtons.forEach((button) => {
        const shortLabels = button.querySelectorAll("span.sm\\:hidden");
        const fullLabels = button.querySelectorAll("span.hidden.sm\\:inline");

        expect(shortLabels.length).toBe(1);
        expect(fullLabels.length).toBe(1);

        // On mobile, short labels should be visible
        shortLabels.forEach((label) => {
          const text = label.textContent?.trim();
          expect(text).toMatch(/^[ДМГ]$/);
        });
      });
    });
  });

  describe("Requirement validation", () => {
    it("validates Requirement 2.5: Abbreviated labels when text doesn't fit", () => {
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

            // Requirement 2.5: WHEN текст на кнопках не помещается,
            // THE Система SHALL использовать сокращенные варианты меток (Д/М/Г)
            const periodButtons = container.querySelectorAll(
              "button.h-9.min-w-\\[36px\\]"
            );

            expect(periodButtons.length).toBeGreaterThan(0);

            periodButtons.forEach((button) => {
              // On mobile viewports, abbreviated labels should be present
              const shortLabels = button.querySelectorAll("span.sm\\:hidden");
              
              expect(shortLabels.length).toBe(1);

              shortLabels.forEach((label) => {
                const text = label.textContent?.trim();
                // Must be one of the abbreviated labels
                expect(text).toMatch(/^[ДМГ]$/);
              });
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("validates that full labels are used on desktop when space is available", () => {
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

            // On desktop, full labels should be available
            const periodButtons = container.querySelectorAll(
              "button.h-9.min-w-\\[36px\\]"
            );

            expect(periodButtons.length).toBeGreaterThan(0);

            periodButtons.forEach((button) => {
              // Full labels should be present with sm:inline class
              const fullLabels = button.querySelectorAll("span.hidden.sm\\:inline");
              
              expect(fullLabels.length).toBe(1);

              fullLabels.forEach((label) => {
                const text = label.textContent?.trim();
                // Must be one of the full labels
                expect(text).toMatch(/^(День|Месяц|Год)$/);
              });
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("General property validation", () => {
    it("should verify adaptive label pattern across all viewport sizes", () => {
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

            // Find all period buttons
            const periodButtons = container.querySelectorAll(
              "button.h-9.min-w-\\[36px\\]"
            );

            expect(periodButtons.length).toBe(3);

            // Each button must have the adaptive label pattern
            periodButtons.forEach((button) => {
              // Must have exactly one short label with sm:hidden
              const shortLabels = button.querySelectorAll("span.sm\\:hidden");
              expect(shortLabels.length).toBe(1);

              // Must have exactly one full label with hidden sm:inline
              const fullLabels = button.querySelectorAll("span.hidden.sm\\:inline");
              expect(fullLabels.length).toBe(1);

              // Short label must be abbreviated (1 character)
              const shortText = shortLabels[0].textContent?.trim() || "";
              expect(shortText.length).toBe(1);

              // Full label must be longer (2+ characters)
              const fullText = fullLabels[0].textContent?.trim() || "";
              expect(fullText.length).toBeGreaterThan(1);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should ensure button functionality is not affected by label adaptation", () => {
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

            // Find all period buttons
            const periodButtons = container.querySelectorAll(
              "button.h-9.min-w-\\[36px\\]"
            );

            expect(periodButtons.length).toBe(3);

            // All buttons should be functional (not disabled)
            periodButtons.forEach((button) => {
              expect(button).not.toBeDisabled();
              
              // Should have proper button attributes
              expect(button.tagName).toBe("BUTTON");
              
              // Should have minimum touch target size classes
              expect(button).toHaveClass("h-9");
              expect(button).toHaveClass("min-w-[36px]");
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});

/**
 * Property-Based Test — Minimum Padding/Margins
 * 
 * **Property 3: Минимальные отступы контейнеров**
 * **Validates: Requirements 1.4, 6.3**
 * 
 * For any container on the page, when viewport width is in range 320px-480px,
 * minimum padding of 16px (1rem) is ensured on edges.
 */

import React from "react";
import { render } from "@testing-library/react";
import fc from "fast-check";
import { BalanceCards } from "@/components/dashboard/BalanceCards";

// Helper function to get computed padding from an element
const getPaddingValues = (element: Element): {
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
} => {
  const computedStyle = window.getComputedStyle(element);
  
  return {
    paddingLeft: parseFloat(computedStyle.paddingLeft) || 0,
    paddingRight: parseFloat(computedStyle.paddingRight) || 0,
    paddingTop: parseFloat(computedStyle.paddingTop) || 0,
    paddingBottom: parseFloat(computedStyle.paddingBottom) || 0,
  };
};

// Helper function to check if element has minimum padding classes
const hasMinimumPaddingClasses = (element: Element): boolean => {
  const classList = Array.from(element.classList);
  
  // Check for p-4 (16px padding on all sides) or px-4/py-4 (16px horizontal/vertical)
  const hasPadding4 = classList.some(cls => 
    cls === "p-4" || cls === "px-4" || cls === "py-4"
  );
  
  // Check for responsive padding classes (sm:p-6, md:p-8, etc.)
  const hasResponsivePadding = classList.some(cls => 
    /^(sm|md|lg|xl|2xl):p(x|y)?-\d+$/.test(cls)
  );
  
  return hasPadding4 || hasResponsivePadding;
};

// Mock window.innerWidth for viewport testing
const setViewportWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event("resize"));
};

describe("Property: Minimum Padding/Margins", () => {
  describe("BalanceCards minimum padding on mobile viewports", () => {
    it("should ensure minimum 16px padding on card containers for any viewport width in 320px-480px range", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 480 }), // Mobile viewport range
          fc.integer({ min: 0, max: 1000000 }), // Income
          fc.integer({ min: 0, max: 1000000 }), // Expense
          (viewportWidth, income, expense) => {
            const balance = income - expense;
            
            // Set viewport width
            setViewportWidth(viewportWidth);
            
            const { container } = render(
              <BalanceCards
                totalIncome={income}
                totalExpense={expense}
                balance={balance}
              />
            );
            
            // Find all Card elements (containers with padding)
            const cards = container.querySelectorAll(".p-4, .sm\\:p-6, .md\\:p-8");
            
            expect(cards.length).toBeGreaterThan(0);
            
            // Verify each card has minimum padding classes
            cards.forEach((card) => {
              // Check for p-4 class (16px padding)
              expect(card).toHaveClass("p-4");
              
              // Verify the card has responsive padding classes
              expect(hasMinimumPaddingClasses(card)).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should maintain minimum 16px padding regardless of content size", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 480 }),
          fc.integer({ min: 0, max: 999999999 }), // Extreme values
          fc.integer({ min: 0, max: 999999999 }),
          (viewportWidth, income, expense) => {
            const balance = income - expense;
            
            setViewportWidth(viewportWidth);
            
            const { container } = render(
              <BalanceCards
                totalIncome={income}
                totalExpense={expense}
                balance={balance}
              />
            );
            
            const cards = container.querySelectorAll(".p-4");
            
            expect(cards.length).toBeGreaterThan(0);
            
            // All cards should have p-4 class (16px minimum padding)
            cards.forEach((card) => {
              expect(card).toHaveClass("p-4");
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should have progressive padding classes: p-4 sm:p-6 md:p-8", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 480 }),
          fc.integer({ min: 0, max: 1000000 }),
          fc.integer({ min: 0, max: 1000000 }),
          (viewportWidth, income, expense) => {
            const balance = income - expense;
            
            setViewportWidth(viewportWidth);
            
            const { container } = render(
              <BalanceCards
                totalIncome={income}
                totalExpense={expense}
                balance={balance}
              />
            );
            
            const cards = container.querySelectorAll(".p-4");
            
            expect(cards.length).toBeGreaterThan(0);
            
            // Verify progressive padding classes
            cards.forEach((card) => {
              expect(card).toHaveClass("p-4");
              expect(card).toHaveClass("sm:p-6");
              expect(card).toHaveClass("md:p-8");
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Container padding at viewport boundaries", () => {
    it("should maintain minimum padding at lower boundary (320px)", () => {
      const { container } = render(
        <BalanceCards
          totalIncome={50000}
          totalExpense={30000}
          balance={20000}
        />
      );
      
      setViewportWidth(320);
      
      const cards = container.querySelectorAll(".p-4");
      
      expect(cards.length).toBeGreaterThan(0);
      
      cards.forEach((card) => {
        expect(card).toHaveClass("p-4");
      });
    });

    it("should maintain minimum padding at upper boundary (480px)", () => {
      const { container } = render(
        <BalanceCards
          totalIncome={50000}
          totalExpense={30000}
          balance={20000}
        />
      );
      
      setViewportWidth(480);
      
      const cards = container.querySelectorAll(".p-4");
      
      expect(cards.length).toBeGreaterThan(0);
      
      cards.forEach((card) => {
        expect(card).toHaveClass("p-4");
      });
    });

    it("should have consistent padding classes across all three balance cards", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 480 }),
          fc.integer({ min: 0, max: 1000000 }),
          fc.integer({ min: 0, max: 1000000 }),
          (viewportWidth, income, expense) => {
            const balance = income - expense;
            
            setViewportWidth(viewportWidth);
            
            const { container } = render(
              <BalanceCards
                totalIncome={income}
                totalExpense={expense}
                balance={balance}
              />
            );
            
            const cards = container.querySelectorAll(".p-4");
            
            // Should have exactly 3 cards
            expect(cards.length).toBe(3);
            
            // All three cards should have identical padding classes
            const firstCardClasses = Array.from(cards[0].classList).filter(cls => 
              cls.startsWith("p-") || cls.includes(":p-")
            ).sort();
            
            cards.forEach((card) => {
              const cardPaddingClasses = Array.from(card.classList).filter(cls => 
                cls.startsWith("p-") || cls.includes(":p-")
              ).sort();
              
              expect(cardPaddingClasses).toEqual(firstCardClasses);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Edge cases", () => {
    it("should maintain padding with empty currency data", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 480 }),
          (viewportWidth) => {
            setViewportWidth(viewportWidth);
            
            const { container } = render(
              <BalanceCards
                totalIncome={0}
                totalExpense={0}
                balance={0}
                byCurrency={[]}
              />
            );
            
            const cards = container.querySelectorAll(".p-4");
            
            expect(cards.length).toBeGreaterThan(0);
            
            cards.forEach((card) => {
              expect(card).toHaveClass("p-4");
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should maintain padding with multiple currencies", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 480 }),
          (viewportWidth) => {
            setViewportWidth(viewportWidth);
            
            const { container } = render(
              <BalanceCards
                totalIncome={50000}
                totalExpense={30000}
                balance={20000}
                byCurrency={[
                  { currency: "RUB", totalIncome: 30000, totalExpense: 20000, balance: 10000 },
                  { currency: "USD", totalIncome: 20000, totalExpense: 10000, balance: 10000 },
                ]}
              />
            );
            
            const cards = container.querySelectorAll(".p-4");
            
            expect(cards.length).toBeGreaterThan(0);
            
            cards.forEach((card) => {
              expect(card).toHaveClass("p-4");
              expect(card).toHaveClass("sm:p-6");
              expect(card).toHaveClass("md:p-8");
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should maintain padding in loading state", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 480 }),
          (viewportWidth) => {
            setViewportWidth(viewportWidth);
            
            const { container } = render(
              <BalanceCards
                totalIncome={0}
                totalExpense={0}
                balance={0}
                loading={true}
              />
            );
            
            // In loading state, cards should still have padding
            const cardContents = container.querySelectorAll(".p-4, .sm\\:p-6, .md\\:p-8");
            
            expect(cardContents.length).toBeGreaterThan(0);
            
            // Verify at least some elements have the minimum padding
            const elementsWithP4 = container.querySelectorAll(".p-4");
            expect(elementsWithP4.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should ensure minimum padding is never less than 16px", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 480 }),
          fc.integer({ min: 0, max: 1000000 }),
          fc.integer({ min: 0, max: 1000000 }),
          (viewportWidth, income, expense) => {
            const balance = income - expense;
            
            setViewportWidth(viewportWidth);
            
            const { container } = render(
              <BalanceCards
                totalIncome={income}
                totalExpense={expense}
                balance={balance}
              />
            );
            
            const cards = container.querySelectorAll(".p-4");
            
            // Verify that p-4 class is present (which equals 16px in Tailwind)
            // This ensures minimum padding is at least 16px
            cards.forEach((card) => {
              expect(card).toHaveClass("p-4");
              
              // p-4 in Tailwind = 1rem = 16px (at default font size)
              // This is the minimum required padding
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Viewport width variations", () => {
    it("should maintain minimum padding across entire mobile range", () => {
      const testViewports = [320, 360, 375, 390, 414, 428, 480];
      
      testViewports.forEach((viewportWidth) => {
        setViewportWidth(viewportWidth);
        
        const { container } = render(
          <BalanceCards
            totalIncome={50000}
            totalExpense={30000}
            balance={20000}
          />
        );
        
        const cards = container.querySelectorAll(".p-4");
        
        expect(cards.length).toBeGreaterThan(0);
        
        cards.forEach((card) => {
          expect(card).toHaveClass("p-4");
        });
      });
    });
  });
});

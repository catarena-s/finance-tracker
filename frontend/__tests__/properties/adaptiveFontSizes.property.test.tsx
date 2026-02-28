/**
 * Property-Based Test — Adaptive Font Sizes
 * 
 * **Property 2: Адаптивные размеры шрифтов**
 * **Validates: Requirements 1.2, 6.1**
 * 
 * For any text element with adaptive Tailwind classes, font size should decrease
 * on mobile devices and increase on desktop.
 */

import React from "react";
import { render } from "@testing-library/react";
import fc from "fast-check";
import { BalanceCards } from "@/components/dashboard/BalanceCards";

// Tailwind font size mappings (in pixels at base 16px)
const tailwindFontSizes = {
  "text-xs": 12,
  "text-sm": 14,
  "text-base": 16,
  "text-lg": 18,
  "text-xl": 20,
  "text-2xl": 24,
  "text-3xl": 30,
  "text-4xl": 36,
};

// Helper function to check if element has adaptive font size classes
const hasAdaptiveFontClasses = (element: Element): boolean => {
  const classList = Array.from(element.classList);
  
  // Check for pattern: base size + responsive modifiers
  const hasBaseSize = classList.some(cls => cls.startsWith("text-"));
  const hasSmModifier = classList.some(cls => cls.startsWith("sm:text-"));
  const hasMdModifier = classList.some(cls => cls.startsWith("md:text-"));
  
  return hasBaseSize && (hasSmModifier || hasMdModifier);
};

// Helper function to extract font size class values
const extractFontSizeClasses = (element: Element): {
  base: string | null;
  sm: string | null;
  md: string | null;
} => {
  const classList = Array.from(element.classList);
  
  const base = classList.find(cls => /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl)$/.test(cls)) || null;
  const sm = classList.find(cls => /^sm:text-(xs|sm|base|lg|xl|2xl|3xl|4xl)$/.test(cls))?.replace("sm:", "") || null;
  const md = classList.find(cls => /^md:text-(xs|sm|base|lg|xl|2xl|3xl|4xl)$/.test(cls))?.replace("md:", "") || null;
  
  return { base, sm, md };
};

// Helper function to get numeric font size from class name
const getFontSizeFromClass = (className: string | null): number => {
  if (!className) return 0;
  return tailwindFontSizes[className as keyof typeof tailwindFontSizes] || 0;
};

describe("Property: Adaptive Font Sizes", () => {
  describe("BalanceCards adaptive font sizes", () => {
    it("should have smaller font sizes on mobile than on desktop for amount text", () => {
      fc.assert(
        fc.property(
          // Generate random financial data
          fc.integer({ min: 0, max: 1000000 }),
          fc.integer({ min: 0, max: 1000000 }),
          (income, expense) => {
            const balance = income - expense;
            
            const { container } = render(
              <BalanceCards
                totalIncome={income}
                totalExpense={expense}
                balance={balance}
              />
            );
            
            // Find amount elements with adaptive classes (text-sm sm:text-base md:text-xl lg:text-2xl)
            const amounts = container.querySelectorAll(
              ".text-sm.sm\\:text-base.md\\:text-xl.lg\\:text-2xl"
            );
            
            expect(amounts.length).toBeGreaterThan(0);
            
            // Verify each amount element has progressive font size classes
            amounts.forEach((element) => {
              const fontClasses = extractFontSizeClasses(element);
              
              // Should have base, sm, and md classes
              expect(fontClasses.base).toBe("text-sm");
              expect(fontClasses.sm).toBe("text-base");
              expect(fontClasses.md).toBe("text-xl");
              
              // Verify progressive increase: base < sm < md
              const baseSize = getFontSizeFromClass(fontClasses.base);
              const smSize = getFontSizeFromClass(fontClasses.sm);
              const mdSize = getFontSizeFromClass(fontClasses.md);
              
              expect(baseSize).toBe(14); // text-sm
              expect(smSize).toBe(16);   // text-base
              expect(mdSize).toBe(20);   // text-xl
              
              expect(smSize).toBeGreaterThan(baseSize);
              expect(mdSize).toBeGreaterThan(smSize);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should progressively increase font size across breakpoints", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          fc.integer({ min: 0, max: 1000000 }),
          (income, expense) => {
            const balance = income - expense;
            
            const { container } = render(
              <BalanceCards
                totalIncome={income}
                totalExpense={expense}
                balance={balance}
              />
            );
            
            const amounts = container.querySelectorAll(
              ".text-sm.sm\\:text-base.md\\:text-xl.lg\\:text-2xl"
            );
            
            expect(amounts.length).toBeGreaterThan(0);
            
            amounts.forEach((element) => {
              const fontClasses = extractFontSizeClasses(element);
              
              const baseSize = getFontSizeFromClass(fontClasses.base);
              const smSize = getFontSizeFromClass(fontClasses.sm);
              const mdSize = getFontSizeFromClass(fontClasses.md);
              
              // Verify progressive increase: mobile < tablet < desktop
              expect(baseSize).toBeGreaterThan(0);
              expect(smSize).toBeGreaterThan(0);
              expect(mdSize).toBeGreaterThan(0);
              
              expect(smSize).toBeGreaterThan(baseSize);
              expect(mdSize).toBeGreaterThan(smSize);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("General adaptive font size property", () => {
    it("should ensure all elements with responsive font classes have progressive sizing", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          fc.integer({ min: 0, max: 1000000 }),
          (income, expense) => {
            const balance = income - expense;
            
            const { container } = render(
              <BalanceCards
                totalIncome={income}
                totalExpense={expense}
                balance={balance}
              />
            );
            
            // Find all elements with adaptive font size classes
            const adaptiveElements = container.querySelectorAll(
              ".text-sm.sm\\:text-base.md\\:text-xl.lg\\:text-2xl"
            );
            
            adaptiveElements.forEach((element) => {
              const fontClasses = extractFontSizeClasses(element);
              
              // Verify element has adaptive classes
              expect(hasAdaptiveFontClasses(element)).toBe(true);
              
              // Verify font sizes are in ascending order
              const baseSize = getFontSizeFromClass(fontClasses.base);
              const smSize = getFontSizeFromClass(fontClasses.sm);
              const mdSize = getFontSizeFromClass(fontClasses.md);
              
              if (smSize > 0) {
                expect(smSize).toBeGreaterThanOrEqual(baseSize);
              }
              if (mdSize > 0) {
                expect(mdSize).toBeGreaterThanOrEqual(smSize || baseSize);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Edge cases", () => {
    it("should have consistent adaptive classes regardless of data values", () => {
      const { container } = render(
        <BalanceCards
          totalIncome={50000}
          totalExpense={30000}
          balance={20000}
        />
      );
      
      const amounts = container.querySelectorAll(
        ".text-sm.sm\\:text-base.md\\:text-xl.lg\\:text-2xl"
      );
      
      amounts.forEach((element) => {
        const fontClasses = extractFontSizeClasses(element);
        
        // Should use mobile size (text-sm) as base
        expect(fontClasses.base).toBe("text-sm");
        expect(fontClasses.sm).toBe("text-base");
        expect(fontClasses.md).toBe("text-xl");
      });
    });

    it("should maintain adaptive font classes with extreme values", () => {
      const extremeCases = [
        { income: 0, expense: 0, balance: 0 },
        { income: 999999999, expense: 0, balance: 999999999 },
        { income: 0, expense: 999999999, balance: -999999999 },
      ];
      
      extremeCases.forEach(({ income, expense, balance }) => {
        const { container } = render(
          <BalanceCards
            totalIncome={income}
            totalExpense={expense}
            balance={balance}
          />
        );
        
        const amounts = container.querySelectorAll(
          ".text-sm.sm\\:text-base.md\\:text-xl.lg\\:text-2xl"
        );
        
        expect(amounts.length).toBeGreaterThan(0);
        
        amounts.forEach((element) => {
          const fontClasses = extractFontSizeClasses(element);
          
          const baseSize = getFontSizeFromClass(fontClasses.base);
          const smSize = getFontSizeFromClass(fontClasses.sm);
          const mdSize = getFontSizeFromClass(fontClasses.md);
          
          // Verify progressive sizing is maintained
          expect(baseSize).toBe(14);
          expect(smSize).toBe(16);
          expect(mdSize).toBe(20);
          expect(smSize).toBeGreaterThan(baseSize);
          expect(mdSize).toBeGreaterThan(smSize);
        });
      });
    });

    it("should apply adaptive font classes to all three balance cards", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          fc.integer({ min: 0, max: 1000000 }),
          (income, expense) => {
            const balance = income - expense;
            
            const { container } = render(
              <BalanceCards
                totalIncome={income}
                totalExpense={expense}
                balance={balance}
              />
            );
            
            const amounts = container.querySelectorAll(
              ".text-sm.sm\\:text-base.md\\:text-xl.lg\\:text-2xl"
            );
            
            // Should have exactly 3 amount elements (income, expense, balance)
            expect(amounts.length).toBe(3);
            
            // All three should have the same adaptive font classes
            amounts.forEach((element) => {
              expect(element).toHaveClass("text-sm");
              expect(element).toHaveClass("sm:text-base");
              expect(element).toHaveClass("md:text-xl");
              expect(element).toHaveClass("lg:text-2xl");
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

/**
 * Property-Based Test — Icon Proportions
 * 
 * **Property 4: Сохранение пропорций иконок**
 * **Validates: Requirements 1.5, 5.5**
 * 
 * For any icon in components, the width-to-height ratio should remain 1:1
 * on all screen sizes.
 */

import React from "react";
import { render } from "@testing-library/react";
import fc from "fast-check";
import { BalanceCards } from "@/components/dashboard/BalanceCards";
import { CategoryCard } from "@/components/categories/CategoryCard";
import type { Category } from "@/types/api";
import { getNumRuns, getTimeout } from "./propertyTestConfig";

// Helper function to extract icon size classes
const extractIconSizeClasses = (element: Element): {
  baseHeight: string | null;
  baseWidth: string | null;
  smHeight: string | null;
  smWidth: string | null;
  mdHeight: string | null;
  mdWidth: string | null;
} => {
  const classList = Array.from(element.classList);
  
  // Extract base size classes (h-X, w-X)
  const baseHeight = classList.find(cls => /^h-\d+(\.\d+)?$/.test(cls)) || null;
  const baseWidth = classList.find(cls => /^w-\d+(\.\d+)?$/.test(cls)) || null;
  
  // Extract sm: responsive classes
  const smHeight = classList.find(cls => /^sm:h-\d+(\.\d+)?$/.test(cls))?.replace("sm:", "") || null;
  const smWidth = classList.find(cls => /^sm:w-\d+(\.\d+)?$/.test(cls))?.replace("sm:", "") || null;
  
  // Extract md: responsive classes
  const mdHeight = classList.find(cls => /^md:h-\d+(\.\d+)?$/.test(cls))?.replace("md:", "") || null;
  const mdWidth = classList.find(cls => /^md:w-\d+(\.\d+)?$/.test(cls))?.replace("md:", "") || null;
  
  return { baseHeight, baseWidth, smHeight, smWidth, mdHeight, mdWidth };
};

// Helper function to extract numeric value from size class (e.g., "h-5" -> "5", "h-3.5" -> "3.5")
const extractSizeValue = (sizeClass: string | null): string | null => {
  if (!sizeClass) return null;
  const match = sizeClass.match(/[hw]-(\d+(?:\.\d+)?)/);
  return match ? match[1] : null;
};

// Helper function to verify 1:1 aspect ratio
const verifySquareAspectRatio = (height: string | null, width: string | null): boolean => {
  if (!height || !width) return false;
  const heightValue = extractSizeValue(height);
  const widthValue = extractSizeValue(width);
  return heightValue === widthValue && heightValue !== null;
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

describe("Property: Icon Proportions", () => {
  describe("BalanceCards icon proportions", () => {
    it("should maintain 1:1 aspect ratio for all icons at any viewport width", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1440 }), // Viewport width
          fc.integer({ min: 0, max: 1000000 }), // Income
          fc.integer({ min: 0, max: 1000000 }), // Expense
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
            
            // Find all icon elements (lucide-react icons have specific classes)
            const icons = container.querySelectorAll("svg");
            
            expect(icons.length).toBeGreaterThan(0);
            
            // Verify each icon has 1:1 aspect ratio
            icons.forEach((icon) => {
              const sizeClasses = extractIconSizeClasses(icon);
              
              // Check base size (mobile)
              expect(verifySquareAspectRatio(
                sizeClasses.baseHeight,
                sizeClasses.baseWidth
              )).toBe(true);
              
              // If responsive classes exist, they should also maintain 1:1 ratio
              if (sizeClasses.smHeight || sizeClasses.smWidth) {
                expect(verifySquareAspectRatio(
                  sizeClasses.smHeight,
                  sizeClasses.smWidth
                )).toBe(true);
              }
              
              if (sizeClasses.mdHeight || sizeClasses.mdWidth) {
                expect(verifySquareAspectRatio(
                  sizeClasses.mdHeight,
                  sizeClasses.mdWidth
                )).toBe(true);
              }
            });
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("should have matching height and width classes for all icons", () => {
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
            
            const icons = container.querySelectorAll("svg");
            
            icons.forEach((icon) => {
              const sizeClasses = extractIconSizeClasses(icon);
              
              // Base classes should match (compare numeric values)
              const baseHeightValue = extractSizeValue(sizeClasses.baseHeight);
              const baseWidthValue = extractSizeValue(sizeClasses.baseWidth);
              expect(baseHeightValue).toBe(baseWidthValue);
              
              // Responsive classes should match if they exist
              if (sizeClasses.smHeight || sizeClasses.smWidth) {
                const smHeightValue = extractSizeValue(sizeClasses.smHeight);
                const smWidthValue = extractSizeValue(sizeClasses.smWidth);
                expect(smHeightValue).toBe(smWidthValue);
              }
              
              if (sizeClasses.mdHeight || sizeClasses.mdWidth) {
                const mdHeightValue = extractSizeValue(sizeClasses.mdHeight);
                const mdWidthValue = extractSizeValue(sizeClasses.mdWidth);
                expect(mdHeightValue).toBe(mdWidthValue);
              }
            });
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("should maintain icon proportions across all breakpoints", () => {
      const breakpoints = [320, 375, 640, 768, 1024, 1280, 1440];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...breakpoints),
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
            
            const icons = container.querySelectorAll("svg");
            
            icons.forEach((icon) => {
              const sizeClasses = extractIconSizeClasses(icon);
              
              // All size classes should maintain 1:1 ratio (compare numeric values)
              const baseHeightValue = extractSizeValue(sizeClasses.baseHeight);
              const baseWidthValue = extractSizeValue(sizeClasses.baseWidth);
              expect(baseHeightValue).toBe(baseWidthValue);
              
              if (sizeClasses.smHeight) {
                const smHeightValue = extractSizeValue(sizeClasses.smHeight);
                const smWidthValue = extractSizeValue(sizeClasses.smWidth);
                expect(smHeightValue).toBe(smWidthValue);
              }
              
              if (sizeClasses.mdHeight) {
                const mdHeightValue = extractSizeValue(sizeClasses.mdHeight);
                const mdWidthValue = extractSizeValue(sizeClasses.mdWidth);
                expect(mdHeightValue).toBe(mdWidthValue);
              }
            });
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });
  });

  describe("CategoryCard icon proportions", () => {
    // Generator for category data
    const categoryArbitrary = fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      type: fc.constantFrom("income" as const, "expense" as const),
      color: fc.hexaString().map(hex => `#${hex.slice(0, 6).padEnd(6, '0')}`),
      icon: fc.string({ minLength: 1, maxLength: 2 }), // Emoji
      createdAt: fc.constant(new Date().toISOString()),
      updatedAt: fc.constant(new Date().toISOString()),
    });

    it("should maintain 1:1 aspect ratio for category icons at any viewport width", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1440 }),
          categoryArbitrary,
          (viewportWidth, category) => {
            setViewportWidth(viewportWidth);
            
            const { container } = render(
              <CategoryCard
                category={category}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            );
            
            const icons = container.querySelectorAll("svg");
            
            expect(icons.length).toBeGreaterThan(0);
            
            icons.forEach((icon) => {
              const sizeClasses = extractIconSizeClasses(icon);
              
              // Verify 1:1 aspect ratio
              expect(verifySquareAspectRatio(
                sizeClasses.baseHeight,
                sizeClasses.baseWidth
              )).toBe(true);
              
              // Check responsive classes if they exist
              if (sizeClasses.smHeight || sizeClasses.smWidth) {
                expect(verifySquareAspectRatio(
                  sizeClasses.smHeight,
                  sizeClasses.smWidth
                )).toBe(true);
              }
            });
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("should have matching height and width for action button icons", () => {
      fc.assert(
        fc.property(
          categoryArbitrary,
          (category) => {
            const { container } = render(
              <CategoryCard
                category={category}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            );
            
            // Find action button icons (Pencil, Trash2)
            const actionButtons = container.querySelectorAll("button");
            
            actionButtons.forEach((button) => {
              const icons = button.querySelectorAll("svg");
              
              icons.forEach((icon) => {
                const sizeClasses = extractIconSizeClasses(icon);
                
                // Height and width should match (compare numeric values)
                const baseHeightValue = extractSizeValue(sizeClasses.baseHeight);
                const baseWidthValue = extractSizeValue(sizeClasses.baseWidth);
                expect(baseHeightValue).toBe(baseWidthValue);
              });
            });
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("should maintain icon proportions for category icon at all viewport sizes", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1440 }),
          categoryArbitrary,
          (viewportWidth, category) => {
            setViewportWidth(viewportWidth);
            
            const { container } = render(
              <CategoryCard
                category={category}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            );
            
            // Find the category icon container
            const iconContainer = container.querySelector('[aria-label="Иконка категории"]');
            expect(iconContainer).toBeTruthy();
            
            if (iconContainer) {
              const icon = iconContainer.querySelector("svg");
              
              if (icon) {
                const sizeClasses = extractIconSizeClasses(icon);
                
                // Verify 1:1 aspect ratio (compare numeric values)
                const baseHeightValue = extractSizeValue(sizeClasses.baseHeight);
                const baseWidthValue = extractSizeValue(sizeClasses.baseWidth);
                expect(baseHeightValue).toBe(baseWidthValue);
              }
            }
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });
  });

  describe("Edge cases", () => {
    it("should maintain icon proportions with extreme financial values", () => {
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
        
        const icons = container.querySelectorAll("svg");
        
        icons.forEach((icon) => {
          const sizeClasses = extractIconSizeClasses(icon);
          
          // Verify 1:1 aspect ratio is maintained (compare numeric values)
          const baseHeightValue = extractSizeValue(sizeClasses.baseHeight);
          const baseWidthValue = extractSizeValue(sizeClasses.baseWidth);
          expect(baseHeightValue).toBe(baseWidthValue);
        });
      });
    });

    it("should maintain icon proportions with multiple currencies", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1440 }),
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
                byCurrency={[
                  { currency: "RUB", totalIncome: income * 0.6, totalExpense: expense * 0.6, balance: balance * 0.6 },
                  { currency: "USD", totalIncome: income * 0.4, totalExpense: expense * 0.4, balance: balance * 0.4 },
                ]}
              />
            );
            
            const icons = container.querySelectorAll("svg");
            
            icons.forEach((icon) => {
              const sizeClasses = extractIconSizeClasses(icon);
              
              // Verify 1:1 aspect ratio (compare numeric values)
              const baseHeightValue = extractSizeValue(sizeClasses.baseHeight);
              const baseWidthValue = extractSizeValue(sizeClasses.baseWidth);
              expect(baseHeightValue).toBe(baseWidthValue);
            });
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("should maintain icon proportions in loading state", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1440 }),
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
            
            // In loading state, there might be no icons, which is acceptable
            const icons = container.querySelectorAll("svg");
            
            // If icons exist, they should maintain proportions
            icons.forEach((icon) => {
              const sizeClasses = extractIconSizeClasses(icon);
              
              if (sizeClasses.baseHeight && sizeClasses.baseWidth) {
                expect(sizeClasses.baseHeight).toBe(sizeClasses.baseWidth);
              }
            });
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("should have consistent icon sizes across all three balance cards", () => {
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
            
            const icons = container.querySelectorAll("svg");
            
            // Should have exactly 3 icons (one per card)
            expect(icons.length).toBe(3);
            
            // All icons should have the same size classes
            const firstIconClasses = extractIconSizeClasses(icons[0]);
            
            icons.forEach((icon) => {
              const iconClasses = extractIconSizeClasses(icon);
              
              expect(iconClasses.baseHeight).toBe(firstIconClasses.baseHeight);
              expect(iconClasses.baseWidth).toBe(firstIconClasses.baseWidth);
              expect(iconClasses.smHeight).toBe(firstIconClasses.smHeight);
              expect(iconClasses.smWidth).toBe(firstIconClasses.smWidth);
            });
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });
  });

  describe("Specific icon size verification", () => {
    it("should use h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 for BalanceCards icons", () => {
      const { container } = render(
        <BalanceCards
          totalIncome={50000}
          totalExpense={30000}
          balance={20000}
        />
      );
      
      const icons = container.querySelectorAll("svg");
      
      icons.forEach((icon) => {
        // Base size should be h-3 w-3
        expect(icon).toHaveClass("h-3");
        expect(icon).toHaveClass("w-3");
        
        // Responsive sizes should be sm:h-4 sm:w-4 md:h-5 md:w-5
        expect(icon).toHaveClass("sm:h-4");
        expect(icon).toHaveClass("sm:w-4");
        expect(icon).toHaveClass("md:h-5");
        expect(icon).toHaveClass("md:w-5");
      });
    });

    it("should use h-5 w-5 for CategoryCard main icon", () => {
      const category: Category = {
        id: "test-id",
        name: "Test Category",
        type: "expense",
        color: "#FF5733",
        icon: "🛒",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const { container } = render(
        <CategoryCard
          category={category}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      );
      
      const iconContainer = container.querySelector('[aria-label="Иконка категории"]');
      const icon = iconContainer?.querySelector("svg");
      
      if (icon) {
        expect(icon).toHaveClass("h-5");
        expect(icon).toHaveClass("w-5");
      }
    });

    it("should use h-3.5 w-3.5 for CategoryCard action button icons", () => {
      const category: Category = {
        id: "test-id",
        name: "Test Category",
        type: "expense",
        color: "#FF5733",
        icon: "🛒",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const { container } = render(
        <CategoryCard
          category={category}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      );
      
      const actionButtons = container.querySelectorAll("button");
      
      actionButtons.forEach((button) => {
        const icon = button.querySelector("svg");
        
        if (icon) {
          expect(icon).toHaveClass("h-3.5");
          expect(icon).toHaveClass("w-3.5");
        }
      });
    });
  });
});

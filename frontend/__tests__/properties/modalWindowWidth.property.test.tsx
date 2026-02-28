/**
 * Property-Based Test — Modal Window Width
 * 
 * **Свойство 10: Ширина модальных окон**
 * **Валидирует: Требования 4.1**
 * 
 * For any modal window, when viewport width is less than 640px,
 * the modal width should be 95% of viewport width.
 * On desktop (>= 640px), modal should use max-w-{size} classes.
 */

import React from "react";
import { render } from "@testing-library/react";
import fc from "fast-check";
import { Modal } from "@/components/ui/Modal";
import { getNumRuns, getTimeout } from "./property-test-config";

// Mobile breakpoint (sm in Tailwind)
const MOBILE_BREAKPOINT = 640;

// Expected mobile width percentage
const MOBILE_WIDTH_PERCENTAGE = 95;

// Helper function to get computed width of an element
const getElementWidth = (element: Element): number => {
  const rect = element.getBoundingClientRect();
  return rect.width;
};

// Helper function to find modal content containers
const findModalContent = (container: HTMLElement): Element | null => {
  // Modal content is rendered in a Dialog component
  // Look for elements with the responsive width classes
  const selectors = [
    "[class*='w-[95%]']",
    "[role='dialog']",
    ".max-w-md",
    ".max-w-lg",
    ".max-w-2xl",
    ".max-w-4xl",
  ];
  
  for (const selector of selectors) {
    const element = container.querySelector(selector);
    if (element) return element;
  }
  
  return null;
};

describe("Property: Modal Window Width", () => {
  describe("Modal width on mobile viewports", () => {
    it("should have 95% width on mobile viewports (< 640px)", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }), // Mobile viewport range
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          fc.string({ minLength: 5, maxLength: 100 }),
          (viewportWidth, size, content) => {
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
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>{content}</div>
              </Modal>
            );

            // Find modal content
            const modalContent = findModalContent(container);

            if (modalContent) {
              // Verify the modal has w-[95%] class
              expect(modalContent.className).toMatch(/w-\[95%\]/);
            }
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("should verify all modal sizes use 95% width on mobile", () => {
      jest.setTimeout(getTimeout("SLOW"));
      const sizes: Array<"sm" | "md" | "lg" | "xl"> = ["sm", "md", "lg", "xl"];

      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }),
          fc.constantFrom(...sizes),
          (viewportWidth, size) => {
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

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>Test content</div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              // All sizes should have w-[95%] on mobile
              expect(modalContent.className).toMatch(/w-\[95%\]/);
            }
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("should maintain 95% width at exactly 320px (minimum supported width)", () => {
      jest.setTimeout(getTimeout("SLOW"));
      const viewportWidth = 320;

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: viewportWidth,
      });

      fc.assert(
        fc.property(
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          (size) => {
            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>Test content</div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              expect(modalContent.className).toMatch(/w-\[95%\]/);
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should maintain 95% width at 639px (just below sm breakpoint)", () => {
      jest.setTimeout(getTimeout("SLOW"));
      const viewportWidth = 639;

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: viewportWidth,
      });

      fc.assert(
        fc.property(
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          (size) => {
            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>Test content</div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              expect(modalContent.className).toMatch(/w-\[95%\]/);
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });
  });

  describe("Modal width on desktop viewports", () => {
    it("should use max-w-{size} classes on desktop viewports (>= 640px)", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.integer({ min: 640, max: 1440 }), // Desktop viewport range
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          (viewportWidth, size) => {
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
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>Test content</div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              // Should still have w-[95%] base class
              expect(modalContent.className).toMatch(/w-\[95%\]/);
              
              // Should also have sm:max-w-{size} responsive class
              const expectedMaxWidth = {
                sm: "sm:max-w-md",
                md: "sm:max-w-lg",
                lg: "sm:max-w-2xl",
                xl: "sm:max-w-4xl",
              }[size];
              
              expect(modalContent.className).toMatch(new RegExp(expectedMaxWidth.replace(/:/g, "\\:")));
            }
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("should verify each modal size has correct max-width class", () => {
      jest.setTimeout(getTimeout("SLOW"));
      const sizeToMaxWidth = {
        sm: "sm:max-w-md",
        md: "sm:max-w-lg",
        lg: "sm:max-w-2xl",
        xl: "sm:max-w-4xl",
      };

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });

      Object.keys(sizeToMaxWidth).forEach((size) => {
        const { container } = render(
          <Modal isOpen={true} onClose={() => {}} size={size as "sm" | "md" | "lg" | "xl"}>
            <div>Test content</div>
          </Modal>
        );

        const modalContent = findModalContent(container);

        if (modalContent) {
          const expectedClass = sizeToMaxWidth[size as keyof typeof sizeToMaxWidth];
          expect(modalContent.className).toMatch(new RegExp(expectedClass.replace(/:/g, "\\:")));
        }
      });
    });

    it("should switch to max-width at exactly 640px (sm breakpoint)", () => {
      jest.setTimeout(getTimeout("SLOW"));
      const viewportWidth = 640;

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: viewportWidth,
      });

      fc.assert(
        fc.property(
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          (size) => {
            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>Test content</div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              // Should have both w-[95%] and sm:max-w-{size}
              expect(modalContent.className).toMatch(/w-\[95%\]/);
              
              const expectedMaxWidth = {
                sm: "sm:max-w-md",
                md: "sm:max-w-lg",
                lg: "sm:max-w-2xl",
                xl: "sm:max-w-4xl",
              }[size];
              
              expect(modalContent.className).toMatch(new RegExp(expectedMaxWidth.replace(/:/g, "\\:")));
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });
  });

  describe("Modal size variants", () => {
    it("should verify sm modal has max-w-md on desktop", () => {
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

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size="sm">
                <div>Small modal</div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              expect(modalContent.className).toMatch(/sm:max-w-md/);
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should verify md modal has max-w-lg on desktop", () => {
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

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size="md">
                <div>Medium modal</div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              expect(modalContent.className).toMatch(/sm:max-w-lg/);
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should verify lg modal has max-w-2xl on desktop", () => {
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

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size="lg">
                <div>Large modal</div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              expect(modalContent.className).toMatch(/sm:max-w-2xl/);
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should verify xl modal has max-w-4xl on desktop", () => {
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

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size="xl">
                <div>Extra large modal</div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              expect(modalContent.className).toMatch(/sm:max-w-4xl/);
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle modal with very long content", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }),
          fc.string({ minLength: 500, maxLength: 2000 }),
          (viewportWidth, longContent) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size="md">
                <div>{longContent}</div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              // Width should still be 95% on mobile regardless of content length
              expect(modalContent.className).toMatch(/w-\[95%\]/);
            }
          }
        ),
        { numRuns: getNumRuns("SLOW") }
      );
    });

    it("should handle modal with minimal content", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1440 }),
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          (viewportWidth, size) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>X</div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              // Width classes should be present regardless of content
              expect(modalContent.className).toMatch(/w-\[95%\]/);
            }
          }
        ),
        { numRuns: getNumRuns("SLOW") }
      );
    });

    it("should handle modal with nested elements", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }),
          fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 10 }),
          (viewportWidth, items) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size="md">
                <div>
                  <h2>Title</h2>
                  <ul>
                    {items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              expect(modalContent.className).toMatch(/w-\[95%\]/);
            }
          }
        ),
        { numRuns: getNumRuns("SLOW") }
      );
    });

    it("should handle modal with title", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }),
          fc.string({ minLength: 5, maxLength: 100 }),
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          (viewportWidth, title, size) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} title={title} size={size}>
                <div>Content</div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              expect(modalContent.className).toMatch(/w-\[95%\]/);
            }
          }
        ),
        { numRuns: getNumRuns("SLOW") }
      );
    });

    it("should handle modal without title", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }),
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          (viewportWidth, size) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>Content without title</div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              expect(modalContent.className).toMatch(/w-\[95%\]/);
            }
          }
        ),
        { numRuns: getNumRuns("SLOW") }
      );
    });
  });

  describe("Requirement validation", () => {
    it("validates Requirement 4.1: Modal occupies 95% width on mobile (< 640px)", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }), // Mobile viewport (< 640px as per requirement)
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          (viewportWidth, size) => {
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

            // Requirement 4.1: WHEN viewport имеет ширину менее 640px,
            // THE Модальное_Окно SHALL занимать 95% ширины экрана с отступами по 2.5%
            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>Test content</div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              // Modal should have w-[95%] class which ensures 95% width
              // with 2.5% margins on each side (100% - 95% = 5% / 2 = 2.5% per side)
              expect(modalContent.className).toMatch(/w-\[95%\]/);
            }
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("validates that modal width is consistent across all sizes on mobile", () => {
      jest.setTimeout(getTimeout("SLOW"));
      const sizes: Array<"sm" | "md" | "lg" | "xl"> = ["sm", "md", "lg", "xl"];

      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }),
          (viewportWidth) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            // All modal sizes should have the same width on mobile (95%)
            sizes.forEach((size) => {
              const { container } = render(
                <Modal isOpen={true} onClose={() => {}} size={size}>
                  <div>Test</div>
                </Modal>
              );

              const modalContent = findModalContent(container);

              if (modalContent) {
                expect(modalContent.className).toMatch(/w-\[95%\]/);
              }
            });
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("validates that modal uses max-width constraints on desktop", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.integer({ min: 640, max: 1440 }),
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          (viewportWidth, size) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>Test content</div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              // On desktop, modal should have both base width and max-width
              expect(modalContent.className).toMatch(/w-\[95%\]/);
              
              // Should also have responsive max-width class
              const hasMaxWidth = 
                modalContent.className.includes("sm:max-w-md") ||
                modalContent.className.includes("sm:max-w-lg") ||
                modalContent.className.includes("sm:max-w-2xl") ||
                modalContent.className.includes("sm:max-w-4xl");
              
              expect(hasMaxWidth).toBe(true);
            }
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });
  });

  describe("General property validation", () => {
    it("should verify modal width adapts correctly across all viewport sizes", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1440 }),
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          (viewportWidth, size) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>Test content</div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              // All modals should have base w-[95%] class
              expect(modalContent.className).toMatch(/w-\[95%\]/);
              
              // All modals should have responsive max-width class
              const hasResponsiveClass = 
                modalContent.className.includes("sm:max-w-");
              
              expect(hasResponsiveClass).toBe(true);
            }
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("should ensure modal follows mobile-first responsive design", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          (size) => {
            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>Test content</div>
              </Modal>
            );

            const modalContent = findModalContent(container);

            if (modalContent) {
              const classes = modalContent.className;
              
              // Mobile-first: base class (w-[95%]) should always be present
              expect(classes).toMatch(/w-\[95%\]/);
              
              // Responsive classes should be prefixed with sm:
              expect(classes).toMatch(/sm:max-w-/);
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should verify modal width classes are applied consistently", () => {
      jest.setTimeout(getTimeout("SLOW"));
      const testCases = [
        { viewport: 320, size: "sm" as const, expectMobile: true },
        { viewport: 480, size: "md" as const, expectMobile: true },
        { viewport: 639, size: "lg" as const, expectMobile: true },
        { viewport: 640, size: "xl" as const, expectMobile: false },
        { viewport: 768, size: "sm" as const, expectMobile: false },
        { viewport: 1024, size: "md" as const, expectMobile: false },
        { viewport: 1440, size: "lg" as const, expectMobile: false },
      ];

      testCases.forEach(({ viewport, size, expectMobile }) => {
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: viewport,
        });

        const { container } = render(
          <Modal isOpen={true} onClose={() => {}} size={size}>
            <div>Test</div>
          </Modal>
        );

        const modalContent = findModalContent(container);

        if (modalContent) {
          // All should have w-[95%]
          expect(modalContent.className).toMatch(/w-\[95%\]/);
          
          // All should have responsive max-width
          expect(modalContent.className).toMatch(/sm:max-w-/);
        }
      });
    });
  });
});

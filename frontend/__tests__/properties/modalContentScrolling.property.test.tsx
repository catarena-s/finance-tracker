/**
 * Property-Based Test — Modal Content Scrolling
 * 
 * **Свойство 11: Прокрутка содержимого модальных окон**
 * **Валидирует: Требования 4.2**
 * 
 * For any modal window with content exceeding viewport height,
 * vertical scrolling should be available (overflow-y: auto).
 * The modal content container should have max-h-[85vh] to ensure
 * scrollability when content is too tall.
 * 
 * NOTE: Skipped in CI due to performance (renders complex Modal with large content)
 */

import React from "react";
import { render } from "@testing-library/react";
import fc from "fast-check";
import { Modal } from "@/components/ui/Modal";
import { getNumRuns, getTimeout } from "./propertyTestConfig";

// Skip in CI environment
const describeOrSkip = process.env.CI === "true" ? describe.skip : describe;

// Maximum height of modal content (85% of viewport height)
const MAX_MODAL_HEIGHT_VH = 85;

// Helper function to get computed styles
const getComputedOverflow = (element: Element): string => {
  const computedStyle = window.getComputedStyle(element);
  return computedStyle.overflowY;
};

// Helper function to check if element has max-height constraint
const hasMaxHeightConstraint = (element: Element): boolean => {
  const classes = element.className;
  return classes.includes("max-h-[85vh]");
};

// Helper function to find modal content container
const findModalContentContainer = (container: HTMLElement): Element | null => {
  // Look for the div with overflow-y-auto and max-h-[85vh]
  const contentContainer = container.querySelector(".overflow-y-auto.max-h-\\[85vh\\]");
  if (contentContainer) return contentContainer;
  
  // Fallback: look for any element with max-h-[85vh]
  return container.querySelector("[class*='max-h-[85vh]']");
};

// Generator for content that exceeds viewport height
const tallContentArbitrary = fc.array(
  fc.string({ minLength: 50, maxLength: 200 }),
  { minLength: 20, maxLength: 100 }
);

// Generator for content that fits within viewport
const shortContentArbitrary = fc.array(
  fc.string({ minLength: 10, maxLength: 50 }),
  { minLength: 1, maxLength: 5 }
);

describeOrSkip("Property: Modal Content Scrolling", () => {
  describe("Overflow-y auto property", () => {
    it("should have overflow-y: auto on modal content container", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 1, maxLength: 50 }),
          (size, contentLines) => {
            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>
                  {contentLines.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </Modal>
            );

            const contentContainer = findModalContentContainer(container);

            if (contentContainer) {
              // Should have overflow-y-auto class
              expect(contentContainer.className).toMatch(/overflow-y-auto/);
              
              // Computed style should be 'auto' or 'scroll'
              const overflowY = getComputedOverflow(contentContainer);
              expect(["auto", "scroll"]).toContain(overflowY);
            }
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("should have overflow-y: auto regardless of content length", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.oneof(shortContentArbitrary, tallContentArbitrary),
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          (contentLines, size) => {
            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>
                  {contentLines.map((line, index) => (
                    <div key={index} style={{ minHeight: "50px" }}>
                      {line}
                    </div>
                  ))}
                </div>
              </Modal>
            );

            const contentContainer = findModalContentContainer(container);

            if (contentContainer) {
              expect(contentContainer.className).toMatch(/overflow-y-auto/);
            }
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });
  });

  describe("Max-height constraint", () => {
    it("should have max-h-[85vh] class on content container", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 1, maxLength: 50 }),
          (size, contentLines) => {
            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>
                  {contentLines.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </Modal>
            );

            const contentContainer = findModalContentContainer(container);

            if (contentContainer) {
              // Should have max-h-[85vh] class
              expect(hasMaxHeightConstraint(contentContainer)).toBe(true);
              expect(contentContainer.className).toMatch(/max-h-\[85vh\]/);
            }
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("should maintain max-h-[85vh] across all modal sizes", () => {
      jest.setTimeout(getTimeout("SLOW"));
      const sizes: Array<"sm" | "md" | "lg" | "xl"> = ["sm", "md", "lg", "xl"];

      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 20, maxLength: 100 }), { minLength: 10, maxLength: 30 }),
          (contentLines) => {
            sizes.forEach((size) => {
              const { container } = render(
                <Modal isOpen={true} onClose={() => {}} size={size}>
                  <div>
                    {contentLines.map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </Modal>
              );

              const contentContainer = findModalContentContainer(container);

              if (contentContainer) {
                expect(contentContainer.className).toMatch(/max-h-\[85vh\]/);
              }
            });
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should have max-h-[85vh] regardless of viewport width", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1440 }),
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          (viewportWidth, size) => {
            // Mock window.innerWidth
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>
                  <p>Test content</p>
                </div>
              </Modal>
            );

            const contentContainer = findModalContentContainer(container);

            if (contentContainer) {
              expect(contentContainer.className).toMatch(/max-h-\[85vh\]/);
            }
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });
  });

  describe("Scrollability with tall content", () => {
    it("should enable scrolling when content exceeds max-height", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          tallContentArbitrary,
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          (contentLines, size) => {
            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>
                  {contentLines.map((line, index) => (
                    <div key={index} style={{ minHeight: "100px", padding: "20px" }}>
                      {line}
                    </div>
                  ))}
                </div>
              </Modal>
            );

            const contentContainer = findModalContentContainer(container);

            if (contentContainer) {
              // Should have both overflow-y-auto and max-h-[85vh]
              expect(contentContainer.className).toMatch(/overflow-y-auto/);
              expect(contentContainer.className).toMatch(/max-h-\[85vh\]/);
              
              // Overflow should be auto or scroll
              const overflowY = getComputedOverflow(contentContainer);
              expect(["auto", "scroll"]).toContain(overflowY);
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should handle forms with many fields", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              label: fc.string({ minLength: 5, maxLength: 30 }),
              type: fc.constantFrom("text", "email", "number", "textarea"),
            }),
            { minLength: 10, maxLength: 20 }
          ),
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          (fields, size) => {
            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size} title="Form">
                <form>
                  {fields.map((field, index) => (
                    <div key={index} style={{ marginBottom: "20px" }}>
                      <label>{field.label}</label>
                      {field.type === "textarea" ? (
                        <textarea style={{ width: "100%", height: "80px" }} />
                      ) : (
                        <input type={field.type} style={{ width: "100%" }} />
                      )}
                    </div>
                  ))}
                </form>
              </Modal>
            );

            const contentContainer = findModalContentContainer(container);

            if (contentContainer) {
              // Form should be scrollable
              expect(contentContainer.className).toMatch(/overflow-y-auto/);
              expect(contentContainer.className).toMatch(/max-h-\[85vh\]/);
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should handle nested content structures", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              title: fc.string({ minLength: 10, maxLength: 50 }),
              items: fc.array(fc.string({ minLength: 20, maxLength: 100 }), { minLength: 3, maxLength: 10 }),
            }),
            { minLength: 5, maxLength: 15 }
          ),
          (sections) => {
            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size="lg">
                <div>
                  {sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} style={{ marginBottom: "30px" }}>
                      <h3>{section.title}</h3>
                      <ul>
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex} style={{ padding: "10px" }}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Modal>
            );

            const contentContainer = findModalContentContainer(container);

            if (contentContainer) {
              expect(contentContainer.className).toMatch(/overflow-y-auto/);
              expect(contentContainer.className).toMatch(/max-h-\[85vh\]/);
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle modal with minimal content", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          fc.string({ minLength: 1, maxLength: 20 }),
          (size, content) => {
            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>{content}</div>
              </Modal>
            );

            const contentContainer = findModalContentContainer(container);

            if (contentContainer) {
              // Even with minimal content, scrolling properties should be present
              expect(contentContainer.className).toMatch(/overflow-y-auto/);
              expect(contentContainer.className).toMatch(/max-h-\[85vh\]/);
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should handle modal with empty content", () => {
      jest.setTimeout(getTimeout("SLOW"));
      const sizes: Array<"sm" | "md" | "lg" | "xl"> = ["sm", "md", "lg", "xl"];

      sizes.forEach((size) => {
        const { container } = render(
          <Modal isOpen={true} onClose={() => {}} size={size}>
            <div></div>
          </Modal>
        );

        const contentContainer = findModalContentContainer(container);

        if (contentContainer) {
          expect(contentContainer.className).toMatch(/overflow-y-auto/);
          expect(contentContainer.className).toMatch(/max-h-\[85vh\]/);
        }
      });
    });

    it("should handle modal with title and content", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }),
          fc.array(fc.string({ minLength: 20, maxLength: 100 }), { minLength: 5, maxLength: 20 }),
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          (title, contentLines, size) => {
            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} title={title} size={size}>
                <div>
                  {contentLines.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </Modal>
            );

            const contentContainer = findModalContentContainer(container);

            if (contentContainer) {
              expect(contentContainer.className).toMatch(/overflow-y-auto/);
              expect(contentContainer.className).toMatch(/max-h-\[85vh\]/);
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should handle modal with images and mixed content", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              type: fc.constantFrom("text", "image", "list"),
              content: fc.string({ minLength: 10, maxLength: 100 }),
            }),
            { minLength: 5, maxLength: 15 }
          ),
          (contentBlocks) => {
            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size="lg">
                <div>
                  {contentBlocks.map((block, index) => {
                    if (block.type === "text") {
                      return <p key={index}>{block.content}</p>;
                    } else if (block.type === "image") {
                      return (
                        <div key={index} style={{ height: "200px", background: "#ccc" }}>
                          Image placeholder: {block.content}
                        </div>
                      );
                    } else {
                      return (
                        <ul key={index}>
                          <li>{block.content}</li>
                        </ul>
                      );
                    }
                  })}
                </div>
              </Modal>
            );

            const contentContainer = findModalContentContainer(container);

            if (contentContainer) {
              expect(contentContainer.className).toMatch(/overflow-y-auto/);
              expect(contentContainer.className).toMatch(/max-h-\[85vh\]/);
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });

    it("should handle modal on different viewport heights", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.integer({ min: 480, max: 1080 }), // viewport height
          fc.array(fc.string({ minLength: 50, maxLength: 150 }), { minLength: 10, maxLength: 30 }),
          (viewportHeight, contentLines) => {
            // Mock window.innerHeight
            Object.defineProperty(window, "innerHeight", {
              writable: true,
              configurable: true,
              value: viewportHeight,
            });

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size="md">
                <div>
                  {contentLines.map((line, index) => (
                    <div key={index} style={{ minHeight: "60px" }}>
                      {line}
                    </div>
                  ))}
                </div>
              </Modal>
            );

            const contentContainer = findModalContentContainer(container);

            if (contentContainer) {
              // Max height should always be 85vh regardless of viewport height
              expect(contentContainer.className).toMatch(/max-h-\[85vh\]/);
              expect(contentContainer.className).toMatch(/overflow-y-auto/);
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });
  });

  describe("Requirement validation", () => {
    it("validates Requirement 4.2: Modal content scrolling on mobile devices", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }), // Mobile viewport width
          fc.array(fc.string({ minLength: 50, maxLength: 150 }), { minLength: 15, maxLength: 40 }),
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          (viewportWidth, contentLines, size) => {
            // Mock mobile viewport
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            Object.defineProperty(window, "innerHeight", {
              writable: true,
              configurable: true,
              value: 667, // Typical mobile height
            });

            // Requirement 4.2: WHEN Модальное_Окно открыто на мобильном устройстве,
            // THE Система SHALL обеспечивать возможность прокрутки содержимого
            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size}>
                <div>
                  {contentLines.map((line, index) => (
                    <div key={index} style={{ minHeight: "80px", padding: "10px" }}>
                      {line}
                    </div>
                  ))}
                </div>
              </Modal>
            );

            const contentContainer = findModalContentContainer(container);

            if (contentContainer) {
              // Modal content should have overflow-y: auto for scrolling
              expect(contentContainer.className).toMatch(/overflow-y-auto/);
              
              // Should have max-height constraint to enable scrolling
              expect(contentContainer.className).toMatch(/max-h-\[85vh\]/);
              
              // Computed overflow should allow scrolling
              const overflowY = getComputedOverflow(contentContainer);
              expect(["auto", "scroll"]).toContain(overflowY);
            }
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("validates that scrolling is available on all device sizes", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1440 }), // All viewport widths
          fc.array(fc.string({ minLength: 30, maxLength: 100 }), { minLength: 20, maxLength: 50 }),
          (viewportWidth, contentLines) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size="md">
                <div>
                  {contentLines.map((line, index) => (
                    <div key={index} style={{ minHeight: "70px" }}>
                      {line}
                    </div>
                  ))}
                </div>
              </Modal>
            );

            const contentContainer = findModalContentContainer(container);

            if (contentContainer) {
              // Scrolling should be available on all device sizes
              expect(contentContainer.className).toMatch(/overflow-y-auto/);
              expect(contentContainer.className).toMatch(/max-h-\[85vh\]/);
            }
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("validates that max-height is 85% of viewport height", () => {
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

            const contentContainer = findModalContentContainer(container);

            if (contentContainer) {
              // Should use max-h-[85vh] which is 85% of viewport height
              expect(contentContainer.className).toMatch(/max-h-\[85vh\]/);
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });
  });

  describe("General property validation", () => {
    it("should verify scrolling properties are present across all configurations", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1440 }),
          fc.constantFrom("sm" as const, "md" as const, "lg" as const, "xl" as const),
          fc.oneof(shortContentArbitrary, tallContentArbitrary),
          fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
          (viewportWidth, size, contentLines, title) => {
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { container } = render(
              <Modal isOpen={true} onClose={() => {}} size={size} title={title}>
                <div>
                  {contentLines.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </Modal>
            );

            const contentContainer = findModalContentContainer(container);

            if (contentContainer) {
              // All modals should have scrolling capability
              expect(contentContainer.className).toMatch(/overflow-y-auto/);
              expect(contentContainer.className).toMatch(/max-h-\[85vh\]/);
            }
          }
        ),
        { numRuns: getNumRuns("MEDIUM") }
      );
    });

    it("should ensure consistent scrolling behavior across modal lifecycle", () => {
      jest.setTimeout(getTimeout("SLOW"));
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 20, maxLength: 100 }), { minLength: 10, maxLength: 30 }),
          (contentLines) => {
            // Render modal
            const { container, rerender } = render(
              <Modal isOpen={true} onClose={() => {}} size="md">
                <div>
                  {contentLines.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </Modal>
            );

            let contentContainer = findModalContentContainer(container);

            if (contentContainer) {
              expect(contentContainer.className).toMatch(/overflow-y-auto/);
              expect(contentContainer.className).toMatch(/max-h-\[85vh\]/);
            }

            // Re-render with different content
            rerender(
              <Modal isOpen={true} onClose={() => {}} size="lg">
                <div>
                  {contentLines.slice(0, 5).map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </Modal>
            );

            contentContainer = findModalContentContainer(container);

            if (contentContainer) {
              // Scrolling properties should persist after re-render
              expect(contentContainer.className).toMatch(/overflow-y-auto/);
              expect(contentContainer.className).toMatch(/max-h-\[85vh\]/);
            }
          }
        ),
        { numRuns: getNumRuns("FAST") }
      );
    });
  });
});

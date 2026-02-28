/**
 * Unit tests — useBreakpoint
 * Тестирование хука для определения текущего размера экрана и брейкпоинта
 */
import { renderHook } from "@testing-library/react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useWindowSize } from "@/hooks/useWindowSize";

// Мокаем useWindowSize
jest.mock("@/hooks/useWindowSize");

const mockUseWindowSize = useWindowSize as jest.MockedFunction<
  typeof useWindowSize
>;

describe("useBreakpoint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("isMobile flag", () => {
    it("should return isMobile=true for width < 640px", () => {
      mockUseWindowSize.mockReturnValue({ width: 375, height: 667 });

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
    });

    it("should return isMobile=false for width >= 640px", () => {
      mockUseWindowSize.mockReturnValue({ width: 640, height: 800 });

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isMobile).toBe(false);
    });
  });

  describe("isTablet flag", () => {
    it("should return isTablet=true for width >= 640px and < 1024px", () => {
      mockUseWindowSize.mockReturnValue({ width: 768, height: 1024 });

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });

    it("should return isTablet=false for width < 640px", () => {
      mockUseWindowSize.mockReturnValue({ width: 500, height: 800 });

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isTablet).toBe(false);
    });

    it("should return isTablet=false for width >= 1024px", () => {
      mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isTablet).toBe(false);
    });
  });

  describe("isDesktop flag", () => {
    it("should return isDesktop=true for width >= 1024px", () => {
      mockUseWindowSize.mockReturnValue({ width: 1280, height: 720 });

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
    });

    it("should return isDesktop=false for width < 1024px", () => {
      mockUseWindowSize.mockReturnValue({ width: 1023, height: 768 });

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isDesktop).toBe(false);
    });
  });

  describe("currentBreakpoint", () => {
    it('should return "xs" for width < 640px', () => {
      mockUseWindowSize.mockReturnValue({ width: 320, height: 568 });

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.currentBreakpoint).toBe("xs");
    });

    it('should return "sm" for width >= 640px and < 768px', () => {
      mockUseWindowSize.mockReturnValue({ width: 640, height: 800 });

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.currentBreakpoint).toBe("sm");
    });

    it('should return "md" for width >= 768px and < 1024px', () => {
      mockUseWindowSize.mockReturnValue({ width: 768, height: 1024 });

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.currentBreakpoint).toBe("md");
    });

    it('should return "lg" for width >= 1024px and < 1280px', () => {
      mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.currentBreakpoint).toBe("lg");
    });

    it('should return "xl" for width >= 1280px and < 1440px', () => {
      mockUseWindowSize.mockReturnValue({ width: 1280, height: 720 });

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.currentBreakpoint).toBe("xl");
    });

    it('should return "2xl" for width >= 1440px', () => {
      mockUseWindowSize.mockReturnValue({ width: 1920, height: 1080 });

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.currentBreakpoint).toBe("2xl");
    });
  });

  describe("width property", () => {
    it("should return the current window width", () => {
      mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.width).toBe(1024);
    });
  });

  describe("edge cases", () => {
    it("should handle width of 0 (SSR scenario)", () => {
      mockUseWindowSize.mockReturnValue({ width: 0, height: 0 });

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.currentBreakpoint).toBe("xs");
    });

    it("should handle exact breakpoint boundaries", () => {
      // Тест на границе sm (640px)
      mockUseWindowSize.mockReturnValue({ width: 639, height: 800 });
      const { result: result1 } = renderHook(() => useBreakpoint());
      expect(result1.current.isMobile).toBe(true);
      expect(result1.current.currentBreakpoint).toBe("xs");

      mockUseWindowSize.mockReturnValue({ width: 640, height: 800 });
      const { result: result2 } = renderHook(() => useBreakpoint());
      expect(result2.current.isMobile).toBe(false);
      expect(result2.current.isTablet).toBe(true);
      expect(result2.current.currentBreakpoint).toBe("sm");

      // Тест на границе lg (1024px)
      mockUseWindowSize.mockReturnValue({ width: 1023, height: 768 });
      const { result: result3 } = renderHook(() => useBreakpoint());
      expect(result3.current.isTablet).toBe(true);
      expect(result3.current.isDesktop).toBe(false);

      mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });
      const { result: result4 } = renderHook(() => useBreakpoint());
      expect(result4.current.isTablet).toBe(false);
      expect(result4.current.isDesktop).toBe(true);
    });
  });

  describe("delay parameter", () => {
    it("should pass delay parameter to useWindowSize", () => {
      mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });

      renderHook(() => useBreakpoint(300));

      expect(mockUseWindowSize).toHaveBeenCalledWith(300);
    });

    it("should use default delay when not provided", () => {
      mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });

      renderHook(() => useBreakpoint());

      expect(mockUseWindowSize).toHaveBeenCalledWith(undefined);
    });
  });
});

import { useMemo } from "react";
import { useWindowSize } from "./useWindowSize";

/**
 * Конфигурация брейкпоинтов (соответствует Tailwind CSS)
 */
interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
}

/**
 * Возвращаемое значение хука useBreakpoint
 */
export interface UseBreakpointReturn {
  /** Мобильное устройство (< 640px) */
  isMobile: boolean;
  /** Планшет (>= 640px && < 1024px) */
  isTablet: boolean;
  /** Десктоп (>= 1024px) */
  isDesktop: boolean;
  /** Текущий брейкпоинт */
  currentBreakpoint: keyof BreakpointConfig | "xs";
  /** Текущая ширина окна */
  width: number;
}

/**
 * Стандартные брейкпоинты Tailwind CSS
 */
const breakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1440,
};

/**
 * Хук для определения текущего размера экрана и брейкпоинта
 *
 * Использует существующий хук useWindowSize для отслеживания размера окна
 * и предоставляет удобный API для определения текущего брейкпоинта.
 *
 * @param delay - Задержка debounce в миллисекундах (по умолчанию 150ms)
 * @returns Объект с флагами устройств и текущим брейкпоинтом
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isMobile, isTablet, isDesktop, currentBreakpoint } = useBreakpoint();
 *
 *   return (
 *     <div>
 *       {isMobile && <MobileView />}
 *       {isTablet && <TabletView />}
 *       {isDesktop && <DesktopView />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBreakpoint(delay?: number): UseBreakpointReturn {
  const { width } = useWindowSize(delay);

  const result = useMemo(() => {
    // Определяем флаги устройств
    const isMobile = width < breakpoints.sm;
    const isTablet = width >= breakpoints.sm && width < breakpoints.lg;
    const isDesktop = width >= breakpoints.lg;

    // Определяем текущий брейкпоинт
    let currentBreakpoint: keyof BreakpointConfig | "xs" = "xs";

    if (width >= breakpoints["2xl"]) {
      currentBreakpoint = "2xl";
    } else if (width >= breakpoints.xl) {
      currentBreakpoint = "xl";
    } else if (width >= breakpoints.lg) {
      currentBreakpoint = "lg";
    } else if (width >= breakpoints.md) {
      currentBreakpoint = "md";
    } else if (width >= breakpoints.sm) {
      currentBreakpoint = "sm";
    }

    return {
      isMobile,
      isTablet,
      isDesktop,
      currentBreakpoint,
      width,
    };
  }, [width]);

  return result;
}

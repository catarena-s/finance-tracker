/**
 * Responsive Design Configuration
 *
 * Централизованная конфигурация для адаптивного дизайна приложения.
 * Определяет брейкпоинты, размеры touch targets, отступы и типографику.
 *
 * Требования: 2.4, 9.3
 */

/**
 * Конфигурация брейкпоинтов (в пикселях)
 * Соответствует стандартным брейкпоинтам Tailwind CSS
 */
export interface BreakpointConfig {
  sm: number; // 640px - Мобильные устройства (landscape) и маленькие планшеты
  md: number; // 768px - Планшеты
  lg: number; // 1024px - Маленькие ноутбуки
  xl: number; // 1280px - Десктопы
  "2xl": number; // 1440px - Большие экраны
}

/**
 * Конфигурация размеров области касания для интерактивных элементов
 * Соответствует рекомендациям WCAG для доступности
 */
export interface TouchTargetConfig {
  minimum: number; // 44px - Минимальный размер (WCAG AAA)
  comfortable: number; // 48px - Комфортный размер
}

/**
 * Конфигурация отступов для разных размеров экрана
 * Использует классы Tailwind CSS
 */
export interface SpacingConfig {
  mobile: {
    container: string; // Отступы контейнера
    card: string; // Отступы карточки
    gap: string; // Промежутки между элементами
  };
  tablet: {
    container: string;
    card: string;
    gap: string;
  };
  desktop: {
    container: string;
    card: string;
    gap: string;
  };
}

/**
 * Конфигурация типографики для разных размеров экрана
 * Использует классы Tailwind CSS
 */
export interface TypographyConfig {
  heading: {
    mobile: string; // Размер заголовка на мобильных
    desktop: string; // Размер заголовка на desktop
  };
  body: {
    mobile: string; // Размер основного текста на мобильных
    desktop: string; // Размер основного текста на desktop
  };
}

/**
 * Конфигурация адаптивных параметров для графиков Chart.js
 * Определяет высоту, количество меток, размер точек и шрифтов для разных размеров экрана
 *
 * Требования: 3.2, 3.4
 */
export interface ChartResponsiveConfig {
  height: Record<"mobile" | "tablet" | "desktop", number>;
  maxTicksLimit: Record<"mobile" | "tablet" | "desktop", number>;
  pointRadius: Record<"mobile" | "tablet" | "desktop", number>;
  fontSize: Record<"mobile" | "tablet" | "desktop", number>;
}

/**
 * Полная конфигурация адаптивного дизайна
 */
export interface ResponsiveConfig {
  breakpoints: BreakpointConfig;
  touchTargetSize: TouchTargetConfig;
  spacing: SpacingConfig;
  typography: TypographyConfig;
}

/**
 * Экспортируемая конфигурация адаптивного дизайна
 *
 * @example
 * ```typescript
 * import { responsiveConfig } from '@/lib/responsiveConfig';
 *
 * // Проверка брейкпоинта
 * if (width >= responsiveConfig.breakpoints.md) {
 *   // Логика для планшетов и больше
 * }
 *
 * // Использование размеров touch targets
 * const buttonSize = responsiveConfig.touchTargetSize.minimum;
 * ```
 */
export const responsiveConfig: Readonly<ResponsiveConfig> = Object.freeze({
  // Брейкпоинты (в пикселях)
  breakpoints: Object.freeze({
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1440,
  }),

  // Размеры области касания (в пикселях)
  // Требование 2.4: минимальная область касания 44x44px
  touchTargetSize: Object.freeze({
    minimum: 44, // WCAG AAA рекомендация
    comfortable: 48, // Более комфортный размер
  }),

  // Отступы для разных размеров экрана
  // Требование 1.4: минимальные отступы 16px по краям на мобильных
  spacing: Object.freeze({
    mobile: Object.freeze({
      container: "px-4", // 16px
      card: "p-4", // 16px
      gap: "gap-4", // 16px
    }),
    tablet: Object.freeze({
      container: "sm:px-6", // 24px
      card: "sm:p-6", // 24px
      gap: "sm:gap-6", // 24px
    }),
    desktop: Object.freeze({
      container: "lg:px-8", // 32px
      card: "lg:p-8", // 32px
      gap: "lg:gap-8", // 32px
    }),
  }),

  // Типографика для разных размеров экрана
  typography: Object.freeze({
    heading: Object.freeze({
      mobile: "text-2xl", // 24px
      desktop: "md:text-3xl", // 30px
    }),
    body: Object.freeze({
      mobile: "text-sm", // 14px
      desktop: "md:text-base", // 16px
    }),
  }),
});

/**
 * Вспомогательная функция для получения классов отступов контейнера
 *
 * @returns Строка с классами Tailwind для адаптивных отступов контейнера
 *
 * @example
 * ```tsx
 * <div className={getContainerSpacing()}>
 *   // Содержимое с адаптивными отступами
 * </div>
 * ```
 */
export function getContainerSpacing(): string {
  const { mobile, tablet, desktop } = responsiveConfig.spacing;
  return `${mobile.container} ${tablet.container} ${desktop.container}`;
}

/**
 * Вспомогательная функция для получения классов отступов карточки
 *
 * @returns Строка с классами Tailwind для адаптивных отступов карточки
 *
 * @example
 * ```tsx
 * <div className={getCardSpacing()}>
 *   // Содержимое карточки с адаптивными отступами
 * </div>
 * ```
 */
export function getCardSpacing(): string {
  const { mobile, tablet, desktop } = responsiveConfig.spacing;
  return `${mobile.card} ${tablet.card} ${desktop.card}`;
}

/**
 * Вспомогательная функция для получения классов промежутков
 *
 * @returns Строка с классами Tailwind для адаптивных промежутков
 *
 * @example
 * ```tsx
 * <div className={`flex ${getGapSpacing()}`}>
 *   // Элементы с адаптивными промежутками
 * </div>
 * ```
 */
export function getGapSpacing(): string {
  const { mobile, tablet, desktop } = responsiveConfig.spacing;
  return `${mobile.gap} ${tablet.gap} ${desktop.gap}`;
}

/**
 * Вспомогательная функция для получения классов типографики заголовка
 *
 * @returns Строка с классами Tailwind для адаптивного размера заголовка
 *
 * @example
 * ```tsx
 * <h1 className={getHeadingTypography()}>
 *   Заголовок страницы
 * </h1>
 * ```
 */
export function getHeadingTypography(): string {
  const { mobile, desktop } = responsiveConfig.typography.heading;
  return `${mobile} ${desktop}`;
}

/**
 * Вспомогательная функция для получения классов типографики основного текста
 *
 * @returns Строка с классами Tailwind для адаптивного размера текста
 *
 * @example
 * ```tsx
 * <p className={getBodyTypography()}>
 *   Основной текст
 * </p>
 * ```
 */
export function getBodyTypography(): string {
  const { mobile, desktop } = responsiveConfig.typography.body;
  return `${mobile} ${desktop}`;
}

/**
 * Вспомогательная функция для получения минимального размера touch target
 *
 * @returns Минимальный размер области касания в пикселях
 *
 * @example
 * ```tsx
 * <button
 *   style={{
 *     minWidth: getTouchTargetSize(),
 *     minHeight: getTouchTargetSize()
 *   }}
 * >
 *   Кнопка
 * </button>
 * ```
 */
export function getTouchTargetSize(): number {
  return responsiveConfig.touchTargetSize.minimum;
}

/**
 * Экспортируемая конфигурация адаптивных параметров для графиков
 *
 * Требования:
 * - 3.2: Минимальная высота графика 256px на мобильных устройствах
 * - 3.4: Автоматическое уменьшение количества меток на оси X для мобильных устройств
 *
 * @example
 * ```typescript
 * import { chartResponsiveConfig } from '@/lib/responsiveConfig';
 * import { useBreakpoint } from '@/hooks/useBreakpoint';
 *
 * function MyChart() {
 *   const { isMobile, isTablet } = useBreakpoint();
 *   const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
 *
 *   const chartOptions = {
 *     scales: {
 *       x: {
 *         ticks: {
 *           maxTicksLimit: chartResponsiveConfig.maxTicksLimit[deviceType],
 *           font: {
 *             size: chartResponsiveConfig.fontSize[deviceType]
 *           }
 *         }
 *       }
 *     },
 *     elements: {
 *       point: {
 *         radius: chartResponsiveConfig.pointRadius[deviceType]
 *       }
 *     }
 *   };
 *
 *   return (
 *     <div style={{ height: chartResponsiveConfig.height[deviceType] }}>
 *       <Chart options={chartOptions} />
 *     </div>
 *   );
 * }
 * ```
 */
export const chartResponsiveConfig: Readonly<ChartResponsiveConfig> = Object.freeze({
  // Высота графиков (в пикселях)
  // Требование 3.2: минимум 256px на мобильных
  height: Object.freeze({
    mobile: 256, // 16rem (h-64 в Tailwind)
    tablet: 320, // 20rem (h-80 в Tailwind)
    desktop: 384, // 24rem (h-96 в Tailwind)
  }),

  // Максимальное количество меток на оси X
  // Требование 3.4: уменьшение количества меток для мобильных устройств
  maxTicksLimit: Object.freeze({
    mobile: 5, // Минимальное количество для читаемости
    tablet: 8, // Среднее количество для планшетов
    desktop: 12, // Полное количество для desktop
  }),

  // Радиус точек на графике (в пикселях)
  // Уменьшение размера точек на мобильных для лучшей читаемости
  pointRadius: Object.freeze({
    mobile: 2, // Маленькие точки для мобильных
    tablet: 3, // Средние точки для планшетов
    desktop: 4, // Стандартные точки для desktop
  }),

  // Размер шрифта для меток и легенды (в пикселях)
  // Адаптивный размер шрифта для разных устройств
  fontSize: Object.freeze({
    mobile: 10, // Маленький шрифт для мобильных
    tablet: 11, // Средний шрифт для планшетов
    desktop: 12, // Стандартный шрифт для desktop
  }),
});

/**
 * Вспомогательная функция для получения адаптивных параметров графика
 * на основе текущего размера экрана
 *
 * @param isMobile - Флаг мобильного устройства
 * @param isTablet - Флаг планшета
 * @returns Объект с параметрами графика для текущего устройства
 *
 * @example
 * ```typescript
 * import { getChartConfig } from '@/lib/responsiveConfig';
 * import { useBreakpoint } from '@/hooks/useBreakpoint';
 *
 * function MyChart() {
 *   const { isMobile, isTablet } = useBreakpoint();
 *   const config = getChartConfig(isMobile, isTablet);
 *
 *   return (
 *     <div style={{ height: config.height }}>
 *       <Chart options={{
 *         scales: {
 *           x: {
 *             ticks: {
 *               maxTicksLimit: config.maxTicksLimit,
 *               font: { size: config.fontSize }
 *             }
 *           }
 *         },
 *         elements: {
 *           point: { radius: config.pointRadius }
 *         }
 *       }} />
 *     </div>
 *   );
 * }
 * ```
 */
export function getChartConfig(
  isMobile: boolean,
  isTablet: boolean
): {
  height: number;
  maxTicksLimit: number;
  pointRadius: number;
  fontSize: number;
} {
  const deviceType = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";

  return {
    height: chartResponsiveConfig.height[deviceType],
    maxTicksLimit: chartResponsiveConfig.maxTicksLimit[deviceType],
    pointRadius: chartResponsiveConfig.pointRadius[deviceType],
    fontSize: chartResponsiveConfig.fontSize[deviceType],
  };
}

/**
 * Вспомогательная функция для получения классов Tailwind для высоты графика
 *
 * @returns Строка с классами Tailwind для адаптивной высоты графика
 *
 * @example
 * ```tsx
 * <div className={getChartHeightClasses()}>
 *   <Chart />
 * </div>
 * ```
 */
export function getChartHeightClasses(): string {
  return "h-64 sm:h-80 lg:h-96";
}

/**
 * Вспомогательная функция для получения классов минимального размера touch target
 *
 * @returns Строка с классами Tailwind для минимального размера кнопки
 *
 * @example
 * ```tsx
 * <button className={getTouchTargetClasses()}>
 *   Кнопка
 * </button>
 * ```
 */
export function getTouchTargetClasses(): string {
  return "min-h-[44px] min-w-[44px]";
}

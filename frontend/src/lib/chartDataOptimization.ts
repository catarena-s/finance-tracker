/**
 * Chart Data Optimization Utilities
 *
 * Функции для оптимизации точек данных графиков на мобильных устройствах.
 * Использует sampling и агрегацию для уменьшения количества отображаемых точек.
 *
 * Требование 10.2: Оптимизация количества отрисовываемых точек данных на мобильных устройствах
 */

/**
 * Интерфейс для точки данных с датой и значением
 */
export interface DataPoint {
  date: string;
  amount: number;
}

/**
 * Максимальное количество точек данных для разных устройств
 */
const MAX_DATA_POINTS = {
  mobile: 20, // Максимум 20 точек на мобильных для производительности
  tablet: 40, // Максимум 40 точек на планшетах
  desktop: 100, // Максимум 100 точек на desktop (без ограничений для большинства случаев)
} as const;

/**
 * Порог, после которого начинается оптимизация данных
 */
const OPTIMIZATION_THRESHOLD = 50;

/**
 * Оптимизирует массив точек данных через sampling (выборку через равные интервалы)
 *
 * Алгоритм:
 * 1. Если точек меньше порога - возвращает исходные данные
 * 2. Вычисляет шаг выборки на основе целевого количества точек
 * 3. Выбирает точки через равные интервалы
 * 4. Всегда включает первую и последнюю точку для сохранения границ
 *
 * @param data - Исходный массив точек данных
 * @param maxPoints - Максимальное количество точек после оптимизации
 * @returns Оптимизированный массив точек данных
 *
 * @example
 * ```typescript
 * const data = [
 *   { date: '2024-01-01', amount: 100 },
 *   { date: '2024-01-02', amount: 150 },
 *   // ... еще 98 точек
 * ];
 *
 * const optimized = sampleDataPoints(data, 20);
 * console.log(optimized.length); // 20
 * ```
 */
export function sampleDataPoints(data: DataPoint[], maxPoints: number): DataPoint[] {
  // Если данных нет или меньше максимума - возвращаем как есть
  if (!data || data.length === 0 || data.length <= maxPoints) {
    return data;
  }

  const result: DataPoint[] = [];
  const step = (data.length - 1) / (maxPoints - 1);

  // Всегда включаем первую точку
  result.push(data[0]);

  // Выбираем точки через равные интервалы
  for (let i = 1; i < maxPoints - 1; i++) {
    const index = Math.round(i * step);
    result.push(data[index]);
  }

  // Всегда включаем последнюю точку
  result.push(data[data.length - 1]);

  return result;
}

/**
 * Оптимизирует массив точек данных через агрегацию (группировку и усреднение)
 *
 * Алгоритм:
 * 1. Если точек меньше порога - возвращает исходные данные
 * 2. Разбивает данные на группы (buckets)
 * 3. Для каждой группы вычисляет среднее значение
 * 4. Использует дату первой точки в группе
 *
 * Этот метод лучше подходит для данных с высокой вариативностью,
 * так как сохраняет общий тренд через усреднение.
 *
 * @param data - Исходный массив точек данных
 * @param maxPoints - Максимальное количество точек после оптимизации
 * @returns Оптимизированный массив точек данных
 *
 * @example
 * ```typescript
 * const data = [
 *   { date: '2024-01-01', amount: 100 },
 *   { date: '2024-01-02', amount: 150 },
 *   { date: '2024-01-03', amount: 120 },
 *   { date: '2024-01-04', amount: 180 },
 * ];
 *
 * const aggregated = aggregateDataPoints(data, 2);
 * // Результат: [
 * //   { date: '2024-01-01', amount: 125 }, // среднее из 100 и 150
 * //   { date: '2024-01-03', amount: 150 }  // среднее из 120 и 180
 * // ]
 * ```
 */
export function aggregateDataPoints(data: DataPoint[], maxPoints: number): DataPoint[] {
  // Если данных нет или меньше максимума - возвращаем как есть
  if (!data || data.length === 0 || data.length <= maxPoints) {
    return data;
  }

  const result: DataPoint[] = [];
  const bucketSize = Math.ceil(data.length / maxPoints);

  for (let i = 0; i < data.length; i += bucketSize) {
    const bucket = data.slice(i, i + bucketSize);

    // Вычисляем среднее значение для группы
    const avgAmount =
      bucket.reduce((sum, point) => sum + point.amount, 0) / bucket.length;

    // Используем дату первой точки в группе
    result.push({
      date: bucket[0].date,
      amount: Math.round(avgAmount * 100) / 100, // Округляем до 2 знаков
    });
  }

  return result;
}

/**
 * Автоматически оптимизирует данные графика на основе размера устройства
 *
 * Выбирает метод оптимизации и целевое количество точек автоматически:
 * - Для мобильных: максимум 20 точек через sampling
 * - Для планшетов: максимум 40 точек через sampling
 * - Для desktop: максимум 100 точек (обычно не требуется оптимизация)
 *
 * Оптимизация применяется только если количество точек превышает 50.
 *
 * @param data - Исходный массив точек данных
 * @param isMobile - Флаг мобильного устройства
 * @param isTablet - Флаг планшета
 * @param useAggregation - Использовать агрегацию вместо sampling (по умолчанию false)
 * @returns Оптимизированный массив точек данных
 *
 * @example
 * ```typescript
 * import { optimizeChartData } from '@/lib/chartDataOptimization';
 * import { useBreakpoint } from '@/hooks/useBreakpoint';
 *
 * function MyChart({ data }: { data: DataPoint[] }) {
 *   const { isMobile, isTablet } = useBreakpoint();
 *   const optimizedData = optimizeChartData(data, isMobile, isTablet);
 *
 *   return <LineChart data={optimizedData} />;
 * }
 * ```
 */
export function optimizeChartData(
  data: DataPoint[],
  isMobile: boolean,
  isTablet: boolean,
  useAggregation = false
): DataPoint[] {
  // Если данных меньше порога - не оптимизируем
  if (!data || data.length <= OPTIMIZATION_THRESHOLD) {
    return data;
  }

  // Определяем максимальное количество точек для устройства
  const maxPoints = isMobile
    ? MAX_DATA_POINTS.mobile
    : isTablet
      ? MAX_DATA_POINTS.tablet
      : MAX_DATA_POINTS.desktop;

  // Если данных меньше максимума для устройства - не оптимизируем
  if (data.length <= maxPoints) {
    return data;
  }

  // Применяем выбранный метод оптимизации
  return useAggregation
    ? aggregateDataPoints(data, maxPoints)
    : sampleDataPoints(data, maxPoints);
}

/**
 * Оптимизирует массив данных любого типа через sampling
 *
 * Универсальная версия функции sampleDataPoints, которая работает с любым типом данных.
 * Полезна для оптимизации данных категорий, списков и других структур.
 *
 * @param data - Исходный массив данных любого типа
 * @param isMobile - Флаг мобильного устройства
 * @param isTablet - Флаг планшета
 * @returns Оптимизированный массив данных
 *
 * @example
 * ```typescript
 * interface Category {
 *   name: string;
 *   amount: number;
 * }
 *
 * const categories: Category[] = [...]; // 100 категорий
 * const optimized = optimizeGenericData(categories, true, false);
 * console.log(optimized.length); // 20 на мобильных
 * ```
 */
export function optimizeGenericData<T>(
  data: T[],
  isMobile: boolean,
  isTablet: boolean
): T[] {
  // Если данных меньше порога - не оптимизируем
  if (!data || data.length <= OPTIMIZATION_THRESHOLD) {
    return data;
  }

  // Определяем максимальное количество точек для устройства
  const maxPoints = isMobile
    ? MAX_DATA_POINTS.mobile
    : isTablet
      ? MAX_DATA_POINTS.tablet
      : MAX_DATA_POINTS.desktop;

  // Если данных меньше максимума для устройства - не оптимизируем
  if (data.length <= maxPoints) {
    return data;
  }

  // Применяем sampling
  const result: T[] = [];
  const step = (data.length - 1) / (maxPoints - 1);

  // Всегда включаем первый элемент
  result.push(data[0]);

  // Выбираем элементы через равные интервалы
  for (let i = 1; i < maxPoints - 1; i++) {
    const index = Math.round(i * step);
    result.push(data[index]);
  }

  // Всегда включаем последний элемент
  result.push(data[data.length - 1]);

  return result;
}

/**
 * Проверяет, нужна ли оптимизация данных для текущего устройства
 *
 * @param dataLength - Количество точек данных
 * @param isMobile - Флаг мобильного устройства
 * @param isTablet - Флаг планшета
 * @returns true, если данные нужно оптимизировать
 *
 * @example
 * ```typescript
 * const needsOptimization = shouldOptimizeData(data.length, isMobile, isTablet);
 * if (needsOptimization) {
 *   console.log('Данные будут оптимизированы для лучшей производительности');
 * }
 * ```
 */
export function shouldOptimizeData(
  dataLength: number,
  isMobile: boolean,
  isTablet: boolean
): boolean {
  if (dataLength <= OPTIMIZATION_THRESHOLD) {
    return false;
  }

  const maxPoints = isMobile
    ? MAX_DATA_POINTS.mobile
    : isTablet
      ? MAX_DATA_POINTS.tablet
      : MAX_DATA_POINTS.desktop;

  return dataLength > maxPoints;
}

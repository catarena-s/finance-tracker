/**
 * Конфигурация для property-based тестов
 * Позволяет настраивать количество прогонов в зависимости от окружения
 */

// Определяем количество прогонов на основе окружения
const isCI = process.env.CI === "true" || process.env.NODE_ENV === "test";
const isFastMode = process.env.FAST_TESTS === "true";

// Конфигурация количества прогонов
export const NUM_RUNS = {
  // Быстрые тесты (простые проверки)
  FAST: isCI ? 2 : isFastMode ? 10 : 50,
  
  // Средние тесты (стандартные проверки)
  MEDIUM: isCI ? 3 : isFastMode ? 20 : 100,
  
  // Медленные тесты (сложные проверки с рендерингом)
  SLOW: isCI ? 1 : isFastMode ? 3 : 20,
  
  // Очень медленные тесты (интеграционные)
  VERY_SLOW: isCI ? 1 : isFastMode ? 2 : 10,
};

// Таймауты для тестов
export const TEST_TIMEOUT = {
  FAST: 15000,   // 15 секунд
  MEDIUM: 20000, // 20 секунд
  SLOW: 45000,   // 45 секунд
  VERY_SLOW: 60000, // 60 секунд
};

// Экспортируем для использования в тестах
export const getNumRuns = (type: keyof typeof NUM_RUNS = "MEDIUM"): number => {
  return NUM_RUNS[type];
};

export const getTimeout = (type: keyof typeof TEST_TIMEOUT = "MEDIUM"): number => {
  return TEST_TIMEOUT[type];
};

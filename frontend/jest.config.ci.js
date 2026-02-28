const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ci.js"],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["/node_modules/", "/e2e/", "propertyTestConfig"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // CI/CD оптимизации
  testTimeout: 90000, // 90 секунд на тест
  maxWorkers: "50%", // Используем 50% CPU для стабильности
  bail: false, // Не останавливаемся на первой ошибке
  forceExit: true, // Принудительный выход после тестов
  detectOpenHandles: false, // Отключаем для скорости
  // Кэширование для ускорения
  cache: true,
  cacheDirectory: "<rootDir>/.jest-cache",
  // Coverage настройки
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/**/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 45,
      statements: 45,
    },
  },
};

module.exports = createJestConfig(customJestConfig);

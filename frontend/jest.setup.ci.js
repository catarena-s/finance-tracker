import "@testing-library/jest-dom";

// Mock react-chartjs-2 components to prevent Canvas API issues
jest.mock("react-chartjs-2");

// Mock Chart.js registration to prevent initialization issues
jest.mock("chart.js", () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  BarElement: jest.fn(),
  ArcElement: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  Filler: jest.fn(),
}));

// Глобальный таймаут для всех тестов в CI/CD
jest.setTimeout(30000);

// Оптимизация для property-based тестов
// Переопределяем глобальные настройки fast-check для CI
if (typeof global !== "undefined") {
  global.FC_NUM_RUNS = 20; // Уменьшаем количество прогонов для CI
}

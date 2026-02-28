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

/**
 * Unit tests — TrendChart
 * Тестирование интерактивности графиков на сенсорных экранах
 * Требования: 3.5
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { Chart } from "chart.js";

// Mock Chart.js to access tooltip functionality
jest.mock("react-chartjs-2", () => ({
  Line: jest.fn(({ data, options }) => {
    // Store the chart configuration for testing
    const chartId = "test-chart";
    return (
      <div data-testid="chart-container" data-chart-id={chartId}>
        <canvas data-testid="chart-canvas" />
      </div>
    );
  }),
}));

describe("TrendChart - Touch Interactivity", () => {
  const mockIncomeData = [
    { date: "2024-01-01", amount: 5000 },
    { date: "2024-01-02", amount: 6000 },
    { date: "2024-01-03", amount: 5500 },
  ];

  const mockExpenseData = [
    { date: "2024-01-01", amount: 3000 },
    { date: "2024-01-02", amount: 3500 },
    { date: "2024-01-03", amount: 3200 },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe("tooltip configuration for touch events", () => {
    it("should configure tooltip with mode 'index' for touch interaction", () => {
      const { Line } = require("react-chartjs-2");
      
      render(
        <TrendChart
          incomeData={mockIncomeData}
          expenseData={mockExpenseData}
        />
      );

      // Verify Line component was called
      expect(Line).toHaveBeenCalled();

      // Get the options passed to the Line component
      const callArgs = Line.mock.calls[0];
      const options = callArgs[0].options;

      // Verify tooltip configuration supports touch interaction
      expect(options.plugins.tooltip).toBeDefined();
      expect(options.plugins.tooltip.mode).toBe("index");
      expect(options.plugins.tooltip.intersect).toBe(false);
    });

    it("should configure tooltip with proper styling for visibility", () => {
      const { Line } = require("react-chartjs-2");
      
      render(
        <TrendChart
          incomeData={mockIncomeData}
          expenseData={mockExpenseData}
        />
      );

      const callArgs = Line.mock.calls[0];
      const tooltipConfig = callArgs[0].options.plugins.tooltip;

      // Verify tooltip has proper styling for touch screens
      expect(tooltipConfig.backgroundColor).toBeDefined();
      expect(tooltipConfig.titleColor).toBeDefined();
      expect(tooltipConfig.bodyColor).toBeDefined();
      expect(tooltipConfig.borderColor).toBeDefined();
      expect(tooltipConfig.borderWidth).toBeDefined();
      expect(tooltipConfig.padding).toBeDefined();
      expect(tooltipConfig.cornerRadius).toBeDefined();
    });

    it("should format tooltip labels with currency", () => {
      const { Line } = require("react-chartjs-2");
      
      render(
        <TrendChart
          incomeData={mockIncomeData}
          expenseData={mockExpenseData}
        />
      );

      const callArgs = Line.mock.calls[0];
      const tooltipConfig = callArgs[0].options.plugins.tooltip;

      // Verify tooltip has label callback for formatting
      expect(tooltipConfig.callbacks).toBeDefined();
      expect(tooltipConfig.callbacks.label).toBeDefined();
      expect(typeof tooltipConfig.callbacks.label).toBe("function");

      // Test the label formatter
      const mockContext = {
        dataset: { label: "Доходы" },
        parsed: { y: 5000 },
      };

      const formattedLabel = tooltipConfig.callbacks.label(mockContext);
      expect(formattedLabel).toContain("Доходы");
      expect(formattedLabel).toContain("5");
    });
  });

  describe("responsive tooltip behavior", () => {
    it("should maintain tooltip configuration on mobile viewports", () => {
      const { Line } = require("react-chartjs-2");
      
      // Set mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TrendChart
          incomeData={mockIncomeData}
          expenseData={mockExpenseData}
        />
      );

      const callArgs = Line.mock.calls[0];
      const tooltipConfig = callArgs[0].options.plugins.tooltip;

      // Tooltip should still be configured on mobile
      expect(tooltipConfig.mode).toBe("index");
      expect(tooltipConfig.intersect).toBe(false);
    });

    it("should maintain tooltip configuration on tablet viewports", () => {
      const { Line } = require("react-chartjs-2");
      
      // Set tablet viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(
        <TrendChart
          incomeData={mockIncomeData}
          expenseData={mockExpenseData}
        />
      );

      const callArgs = Line.mock.calls[0];
      const tooltipConfig = callArgs[0].options.plugins.tooltip;

      // Tooltip should still be configured on tablet
      expect(tooltipConfig.mode).toBe("index");
      expect(tooltipConfig.intersect).toBe(false);
    });

    it("should maintain tooltip configuration on desktop viewports", () => {
      const { Line } = require("react-chartjs-2");
      
      // Set desktop viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(
        <TrendChart
          incomeData={mockIncomeData}
          expenseData={mockExpenseData}
        />
      );

      const callArgs = Line.mock.calls[0];
      const tooltipConfig = callArgs[0].options.plugins.tooltip;

      // Tooltip should be configured on desktop
      expect(tooltipConfig.mode).toBe("index");
      expect(tooltipConfig.intersect).toBe(false);
    });
  });

  describe("chart rendering with tooltip support", () => {
    it("should render chart canvas for touch interaction", () => {
      render(
        <TrendChart
          incomeData={mockIncomeData}
          expenseData={mockExpenseData}
        />
      );

      const canvas = screen.getByTestId("chart-canvas");
      expect(canvas).toBeInTheDocument();
      expect(canvas.tagName).toBe("CANVAS");
    });

    it("should render chart with data for tooltip display", () => {
      const { Line } = require("react-chartjs-2");
      
      render(
        <TrendChart
          incomeData={mockIncomeData}
          expenseData={mockExpenseData}
        />
      );

      const callArgs = Line.mock.calls[0];
      const chartData = callArgs[0].data;

      // Verify chart has data for tooltips to display
      expect(chartData.labels).toHaveLength(3);
      expect(chartData.datasets).toHaveLength(2);
      expect(chartData.datasets[0].label).toBe("Доходы");
      expect(chartData.datasets[1].label).toBe("Расходы");
    });

    it("should not render chart when no data is provided", () => {
      render(<TrendChart incomeData={[]} expenseData={[]} />);

      // Should show "no data" message instead of chart
      expect(screen.getByText("Нет данных для отображения")).toBeInTheDocument();
      expect(screen.queryByTestId("chart-canvas")).not.toBeInTheDocument();
    });
  });

  describe("tooltip accessibility on touch devices", () => {
    it("should configure tooltip with adequate padding for touch targets", () => {
      const { Line } = require("react-chartjs-2");
      
      render(
        <TrendChart
          incomeData={mockIncomeData}
          expenseData={mockExpenseData}
        />
      );

      const callArgs = Line.mock.calls[0];
      const tooltipConfig = callArgs[0].options.plugins.tooltip;

      // Tooltip should have adequate padding for readability on touch screens
      expect(tooltipConfig.padding).toBeGreaterThanOrEqual(8);
    });

    it("should configure tooltip with rounded corners for modern touch UI", () => {
      const { Line } = require("react-chartjs-2");
      
      render(
        <TrendChart
          incomeData={mockIncomeData}
          expenseData={mockExpenseData}
        />
      );

      const callArgs = Line.mock.calls[0];
      const tooltipConfig = callArgs[0].options.plugins.tooltip;

      // Tooltip should have rounded corners for better touch UI
      expect(tooltipConfig.cornerRadius).toBeGreaterThan(0);
    });
  });

  describe("edge cases", () => {
    it("should handle tooltip with null values gracefully", () => {
      const { Line } = require("react-chartjs-2");
      
      render(
        <TrendChart
          incomeData={mockIncomeData}
          expenseData={mockExpenseData}
        />
      );

      const callArgs = Line.mock.calls[0];
      const labelCallback = callArgs[0].options.plugins.tooltip.callbacks.label;

      // Test with null value
      const mockContextWithNull = {
        dataset: { label: "Доходы" },
        parsed: { y: null },
      };

      const result = labelCallback(mockContextWithNull);
      expect(result).toBe("Доходы");
    });

    it("should handle tooltip with missing label gracefully", () => {
      const { Line } = require("react-chartjs-2");
      
      render(
        <TrendChart
          incomeData={mockIncomeData}
          expenseData={mockExpenseData}
        />
      );

      const callArgs = Line.mock.calls[0];
      const labelCallback = callArgs[0].options.plugins.tooltip.callbacks.label;

      // Test with missing label
      const mockContextWithoutLabel = {
        dataset: {},
        parsed: { y: 5000 },
      };

      const result = labelCallback(mockContextWithoutLabel);
      expect(result).toBe("");
    });

    it("should render loading state without tooltip interaction", () => {
      const { container } = render(
        <TrendChart
          incomeData={mockIncomeData}
          expenseData={mockExpenseData}
          loading={true}
        />
      );

      // Should show loading skeleton, not chart
      expect(screen.queryByTestId("chart-canvas")).not.toBeInTheDocument();
      const skeleton = container.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();
    });
  });
});

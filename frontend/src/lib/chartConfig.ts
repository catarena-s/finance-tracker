/**
 * Dark modern dashboard Chart.js configuration
 */

export const CHART_COLORS = {
  primary: "rgba(59, 130, 246, 0.9)", // #3B82F6
  primaryLight: "rgba(59, 130, 246, 0.15)",
  secondary: "rgba(6, 182, 212, 0.9)", // #06B6D4
  secondaryLight: "rgba(6, 182, 212, 0.15)",
  destructive: "rgba(239, 68, 68, 0.9)", // #EF4444
  destructiveLight: "rgba(239, 68, 68, 0.12)",
  grid: "#374151",
  text: "#9CA3AF",
  background: "#1F2933",
} as const;

export const chartGrid = {
  color: CHART_COLORS.grid,
  lineWidth: 0.5,
};

export const chartAnimation = {
  duration: 600,
  easing: "easeInOutQuart" as const,
};

export const tooltipDefaults = {
  backgroundColor: "rgba(31, 41, 51, 0.98)",
  titleColor: "#E5E7EB",
  bodyColor: "#9CA3AF",
  borderColor: "#374151",
  borderWidth: 1,
  padding: 12,
  cornerRadius: 12,
  displayColors: true,
};

export function formatCurrencyTooltip(value: number, currency = "RUB") {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Общая конфигурация Chart.js в стиле light fintech:
 * мягкая палитра (primary/secondary), тонкие сетки, плавная анимация, чистые тултипы.
 */

export const CHART_COLORS = {
  primary: "rgba(99, 102, 241, 0.9)",
  primaryLight: "rgba(99, 102, 241, 0.15)",
  secondary: "rgba(16, 185, 129, 0.9)",
  secondaryLight: "rgba(16, 185, 129, 0.15)",
  destructive: "rgba(239, 68, 68, 0.9)",
  destructiveLight: "rgba(239, 68, 68, 0.12)",
  grid: "#E2E8F0",
  text: "#64748B",
} as const;

export const chartGrid = {
  color: CHART_COLORS.grid,
  lineWidth: 0.5,
};

export const chartAnimation = {
  duration: 600,
};

export const tooltipDefaults = {
  backgroundColor: "rgba(255, 255, 255, 0.98)",
  titleColor: "#0F172A",
  bodyColor: "#64748B",
  borderColor: "#E2E8F0",
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

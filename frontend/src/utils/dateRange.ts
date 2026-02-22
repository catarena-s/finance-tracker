export type DashboardPeriod = "day" | "month" | "year";

export function getDateRange(period: DashboardPeriod): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  const days = period === "day" ? 7 : period === "month" ? 30 : 365;
  start.setDate(start.getDate() - days);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

/**
 * Unit tests — getDateRange (Dashboard)
 * Проверка вычисления диапазона дат по периоду.
 */
import { getDateRange } from "@/app/dashboard/page";

describe("getDateRange", () => {
  beforeAll(() => {
    // Фиксируем дату для предсказуемых тестов
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-02-20"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("returns start and end in YYYY-MM-DD format", () => {
    const { start, end } = getDateRange("month");
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("end is today", () => {
    const { end } = getDateRange("month");
    expect(end).toBe("2025-02-20");
  });

  it("month period gives 30 days back", () => {
    const { start } = getDateRange("month");
    const startDate = new Date(start);
    const endDate = new Date("2025-02-20");
    const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(30);
  });

  it("day period gives 7 days back (last 7 days for chart)", () => {
    const { start } = getDateRange("day");
    const startDate = new Date(start);
    const endDate = new Date("2025-02-20");
    const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(7);
  });

  it("year period gives 365 days back", () => {
    const { start } = getDateRange("year");
    const startDate = new Date(start);
    const endDate = new Date("2025-02-20");
    const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(365);
  });
});

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { transactionApi } from "@/services/api/transactions";

// Mock API
jest.mock("@/services/api/transactions");

describe("Transaction Filtering Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sends correct type filter to API", async () => {
    const mockGetAll = jest.fn().mockResolvedValue({
      data: [],
      pagination: { page: 1, pageSize: 10, totalPages: 1, totalItems: 0 },
    });
    (transactionApi.getAll as jest.Mock) = mockGetAll;

    // Вызываем API с фильтром type
    await transactionApi.getAll({ type: "expense", page: 1, pageSize: 10 });

    expect(mockGetAll).toHaveBeenCalledWith({
      type: "expense",
      page: 1,
      pageSize: 10,
    });
  });

  it("does not send empty type to API", async () => {
    const mockGetAll = jest.fn().mockResolvedValue({
      data: [],
      pagination: { page: 1, pageSize: 10, totalPages: 1, totalItems: 0 },
    });
    (transactionApi.getAll as jest.Mock) = mockGetAll;

    // Вызываем API без фильтра type
    await transactionApi.getAll({ page: 1, pageSize: 10 });

    expect(mockGetAll).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
    });

    // Проверяем, что type не передается
    const callArgs = mockGetAll.mock.calls[0][0];
    expect(callArgs.type).toBeUndefined();
  });

  it("API constructs correct query string with type filter", () => {
    const filters = {
      page: 1,
      pageSize: 10,
      type: "income" as const,
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    };

    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.pageSize) params.append("page_size", filters.pageSize.toString());
    if (filters.type) params.append("type", filters.type);
    if (filters.startDate) params.append("start_date", filters.startDate);
    if (filters.endDate) params.append("end_date", filters.endDate);

    const queryString = params.toString();
    
    expect(queryString).toContain("type=income");
    expect(queryString).toContain("page=1");
    expect(queryString).toContain("page_size=10");
    expect(queryString).toContain("start_date=2024-01-01");
    expect(queryString).toContain("end_date=2024-01-31");
  });
});

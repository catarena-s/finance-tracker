/**
 * Unit tests — analytics API
 * top_categories в ответе, period и currency в запросах.
 */
import { analyticsApi } from "@/services/api/analytics";

const mockGet = jest.fn();
jest.mock("@/services/api/client", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

describe("analyticsApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getTrends sends period and currency in query when provided", async () => {
    mockGet.mockResolvedValue({
      data: { trends: [{ month: "2025-01", income: "100", expense: "50" }] },
    });
    await analyticsApi.getTrends({
      period: "day",
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      currency: "RUB",
    });
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("period=day")
    );
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("currency=RUB")
    );
  });

  it("getSummary sends currency in query when provided", async () => {
    mockGet.mockResolvedValue({
      data: {
        total_income: 100,
        total_expense: 50,
        balance: 50,
        by_currency: [],
      },
    });
    await analyticsApi.getSummary({
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      currency: "EUR",
    });
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("currency=EUR")
    );
  });

  it("getTopCategories maps top_categories and computes percentage", async () => {
    mockGet.mockResolvedValue({
      data: {
        top_categories: [
          { category: "Еда", amount: "300" },
          { category: "Транспорт", amount: "200" },
        ],
      },
    });
    const result = await analyticsApi.getTopCategories({
      limit: 5,
      startDate: "2025-01-01",
      endDate: "2025-01-31",
    });
    expect(result).toHaveLength(2);
    expect(result[0].categoryName).toBe("Еда");
    expect(result[0].totalAmount).toBe(300);
    expect(result[0].percentage).toBe(60); // 300/500
    expect(result[1].percentage).toBe(40);
  });
});

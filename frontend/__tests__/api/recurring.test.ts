import type { RecurringTransactionCreate } from "@/types/api";

describe("Recurring Transactions API Types", () => {
  it("should have correct RecurringTransactionCreate type structure", () => {
    const data: RecurringTransactionCreate = {
      name: "Ежемесячная аренда",
      amount: 30000,
      currency: "RUB",
      categoryId: "cat-456",
      description: "Аренда квартиры",
      type: "expense",
      frequency: "monthly",
      interval: 1,
      startDate: "2024-01-01",
    };

    expect(data.name).toBe("Ежемесячная аренда");
    expect(data.amount).toBe(30000);
    expect(data.type).toBe("expense");
    expect(data.frequency).toBe("monthly");
  });

  it("should allow optional endDate field", () => {
    const dataWithEndDate: RecurringTransactionCreate = {
      name: "Временный шаблон",
      amount: 5000,
      currency: "USD",
      categoryId: "cat-123",
      type: "income",
      frequency: "weekly",
      interval: 1,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    };

    expect(dataWithEndDate.endDate).toBe("2024-12-31");
  });

  it("should allow valid frequency values", () => {
    const frequencies: Array<RecurringTransactionCreate["frequency"]> = [
      "daily",
      "weekly",
      "monthly",
      "yearly",
    ];

    frequencies.forEach((freq) => {
      const data: RecurringTransactionCreate = {
        name: "Test",
        amount: 100,
        currency: "USD",
        categoryId: "cat-1",
        type: "expense",
        frequency: freq,
        interval: 1,
        startDate: "2024-01-01",
      };

      expect(data.frequency).toBe(freq);
    });
  });
});

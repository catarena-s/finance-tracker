import { apiClient } from "./client";
import type { RecurringTransaction, RecurringTransactionCreate } from "@/types/api";

export interface RecurringTransactionUpdate {
  name?: string;
  amount?: number;
  currency?: string;
  categoryId?: string;
  description?: string;
  type?: "income" | "expense";
  frequency?: "daily" | "weekly" | "monthly" | "yearly";
  interval?: number;
  startDate?: string;
  endDate?: string | null;
  isActive?: boolean;
}

/** Тело запроса в формате бэкенда (snake_case) */
function toCreatePayload(data: RecurringTransactionCreate): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: data.name,
    amount: data.amount,
    currency: data.currency ?? "USD",
    category_id: data.categoryId,
    description: data.description ?? null,
    type: data.type,
    frequency: data.frequency,
    interval: data.interval,
    start_date: data.startDate,
  };
  if (data.endDate != null && data.endDate !== "") {
    payload.end_date = data.endDate;
  }
  return payload;
}

function toUpdatePayload(data: RecurringTransactionUpdate): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.amount !== undefined) payload.amount = data.amount;
  if (data.currency !== undefined) payload.currency = data.currency;
  if (data.categoryId !== undefined) payload.category_id = data.categoryId;
  if (data.description !== undefined) payload.description = data.description;
  if (data.type !== undefined) payload.type = data.type;
  if (data.frequency !== undefined) payload.frequency = data.frequency;
  if (data.interval !== undefined) payload.interval = data.interval;
  if (data.startDate !== undefined) payload.start_date = data.startDate;
  if (data.endDate !== undefined) payload.end_date = data.endDate || null;
  if (data.isActive !== undefined) payload.is_active = data.isActive;
  return payload;
}

export const recurringTransactionsApi = {
  async getAll(skip = 0, limit = 100): Promise<RecurringTransaction[]> {
    const res = await apiClient.get<RecurringTransaction[]>(
      "/recurring-transactions/",
      { params: { skip, limit } }
    );
    return res.data;
  },

  async getById(id: string): Promise<RecurringTransaction> {
    const res = await apiClient.get<RecurringTransaction>(
      `/recurring-transactions/${id}`
    );
    return res.data;
  },

  async create(data: RecurringTransactionCreate): Promise<RecurringTransaction> {
    const payload = toCreatePayload(data);
    const res = await apiClient.post<RecurringTransaction>(
      "/recurring-transactions/",
      payload
    );
    return res.data;
  },

  async update(
    id: string,
    data: RecurringTransactionUpdate
  ): Promise<RecurringTransaction> {
    const payload = toUpdatePayload(data);
    const res = await apiClient.put<RecurringTransaction>(
      `/recurring-transactions/${id}`,
      payload
    );
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/recurring-transactions/${id}`);
  },
};

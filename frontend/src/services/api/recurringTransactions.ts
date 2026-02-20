import { apiClient } from "./client";
import type {
  RecurringTransaction,
  RecurringTransactionCreate,
} from "@/types/api";

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
    const res = await apiClient.post<RecurringTransaction>(
      "/recurring-transactions/",
      data
    );
    return res.data;
  },

  async update(
    id: string,
    data: RecurringTransactionUpdate
  ): Promise<RecurringTransaction> {
    const res = await apiClient.put<RecurringTransaction>(
      `/recurring-transactions/${id}`,
      data
    );
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/recurring-transactions/${id}`);
  },
};

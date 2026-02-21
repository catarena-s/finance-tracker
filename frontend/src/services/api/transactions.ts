import { apiClient } from "./client";
import {
  Transaction,
  TransactionWithCategory,
  TransactionType,
  ApiResponse,
  PaginatedResponse,
} from "@/types/api";

export interface TransactionFilters {
  page?: number;
  pageSize?: number;
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateTransactionData {
  type: TransactionType;
  amount: number;
  currency: string;
  categoryId: string;
  description: string;
  transactionDate: string;
  isRecurring?: boolean;
}

export interface UpdateTransactionData {
  type?: TransactionType;
  amount?: number;
  currency?: string;
  categoryId?: string;
  description?: string;
  transactionDate?: string;
  isRecurring?: boolean;
}

// Backend response (camelCase after interceptor; page_size for fallback)
interface BackendPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize?: number;
  page_size?: number;
  pages: number;
}

/**
 * Transaction API клиент
 */
export const transactionApi = {
  async getAll(
    filters: TransactionFilters = {}
  ): Promise<PaginatedResponse<TransactionWithCategory>> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.pageSize) params.append("page_size", filters.pageSize.toString());
    if (filters.type) params.append("type", filters.type);
    if (filters.categoryId) params.append("category_id", filters.categoryId);
    if (filters.startDate) params.append("start_date", filters.startDate);
    if (filters.endDate) params.append("end_date", filters.endDate);

    const response = await apiClient.get<
      BackendPaginatedResponse<TransactionWithCategory>
    >(`/transactions?${params.toString()}`);

    const d = response.data;
    return {
      data: d.items ?? [],
      pagination: {
        page: d.page ?? 1,
        pageSize: d.pageSize ?? d.page_size ?? 10,
        totalPages: d.pages ?? 1,
        totalItems: d.total ?? 0,
      },
    };
  },

  async getById(id: string): Promise<TransactionWithCategory> {
    const response = await apiClient.get<TransactionWithCategory>(
      `/transactions/${id}`
    );
    return response.data;
  },

  async create(data: CreateTransactionData): Promise<Transaction> {
    const response = await apiClient.post<Transaction>("/transactions", data);
    return response.data;
  },

  async update(id: string, data: UpdateTransactionData): Promise<Transaction> {
    const response = await apiClient.put<Transaction>(`/transactions/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/transactions/${id}`);
  },
};

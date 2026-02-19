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
  categoryId: string;
  description: string;
  date: string;
}

export interface UpdateTransactionData {
  type?: TransactionType;
  amount?: number;
  categoryId?: string;
  description?: string;
  date?: string;
}

// Backend response format for paginated data
interface BackendPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

/**
 * Transaction API клиент
 */
export const transactionApi = {
  /**
   * Получить все транзакции с фильтрацией и пагинацией
   */
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

    // Transform backend format to frontend format
    return {
      data: response.data.items,
      pagination: {
        page: response.data.page,
        pageSize: response.data.page_size,
        totalPages: response.data.pages,
        totalItems: response.data.total,
      },
    };
  },

  /**
   * Получить транзакцию по ID
   */
  async getById(id: string): Promise<TransactionWithCategory> {
    const response = await apiClient.get<TransactionWithCategory>(
      `/transactions/${id}`
    );
    return response.data;
  },

  /**
   * Создать новую транзакцию
   */
  async create(data: CreateTransactionData): Promise<Transaction> {
    const response = await apiClient.post<Transaction>("/transactions", data);
    return response.data;
  },

  /**
   * Обновить транзакцию
   */
  async update(id: string, data: UpdateTransactionData): Promise<Transaction> {
    const response = await apiClient.put<Transaction>(`/transactions/${id}`, data);
    return response.data;
  },

  /**
   * Удалить транзакцию
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/transactions/${id}`);
  },
};
